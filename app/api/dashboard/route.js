import { getCollection } from "./db";
import { CACHE_DURATION_MS } from "./constants";
import { fetchLatestSnapshots } from "./services/dashboardService";
import { CITIES as DEFAULT_CITIES } from "./cities";
import connectMongo from "../../../lib/mongodb";
import TrackedCity from "../../../lib/models/TrackedCity";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7", 10);

    const { collection } = await getCollection();
    const now = new Date();

    const latestGlobalEntry = await collection.findOne(
      {},
      {
        sort: { updatedAt: -1 },
      }
    );

    const needsUpdate =
      !latestGlobalEntry ||
      now - new Date(latestGlobalEntry.updatedAt) > CACHE_DURATION_MS;

    if (needsUpdate) {
      const snapshots = await fetchLatestSnapshots();
      if (snapshots.length) {
        await collection.insertMany(snapshots);
      }
    }

    const cutoffDate = new Date(
      now.getTime() - days * 24 * 60 * 60 * 1000
    );

    const history = await collection
      .find({
        updatedAt: {
          $gte: cutoffDate.toISOString(),
        },
      })
      .sort({
        updatedAt: 1,
      })
      .toArray();

    await connectMongo();
    let CITIES = await TrackedCity.find({}).lean();

    if (!CITIES || CITIES.length === 0) {
      await TrackedCity.insertMany(DEFAULT_CITIES);
      CITIES = await TrackedCity.find({}).lean();
    }

    const latestCities = CITIES.map((city) => {
      const cityHistory = history.filter((h) => h.cityId === city.id);
      return cityHistory.length ? cityHistory[cityHistory.length - 1] : null;
    }).filter(Boolean);

    const trends = {};
    CITIES.forEach((city) => {
      trends[city.id] = history
        .filter((h) => h.cityId === city.id)
        .map((h) => ({
          time: h.updatedAt,
          temperatureC: h.weather?.temperatureC ?? null,
          usAqi: h.airQuality?.usAqi ?? null,
        }));
    });

    return Response.json({
      meta: {
        generatedAt: new Date().toISOString(),
        storage: "mongodb",
      },
      cities: latestCities,
      trends,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return Response.json(
      {
        error: "Internal Server Error",
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}