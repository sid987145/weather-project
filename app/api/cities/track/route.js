import connectMongo from "../../../../lib/mongodb";
import TrackedCity from "../../../../lib/models/TrackedCity";
import { AQI_MAP } from "../../dashboard/constants";
import { getCollection } from "../../dashboard/db";

export async function POST(request) {
  try {
    const city = await request.json();
    
    if (!city || !city.id || !city.name || !city.lat || !city.lon) {
      return Response.json({ error: "Missing required city fields" }, { status: 400 });
    }

    await connectMongo();

    // Upsert city to TrackedCity collection
    await TrackedCity.findOneAndUpdate(
      { id: city.id },
      {
        id: city.id,
        name: city.name,
        country: city.country || "Unknown",
        lat: city.lat,
        lon: city.lon,
        pop: city.pop || 0,
        currency: city.currency || "USD",
      },
      { upsert: true, new: true }
    );

    // Fetch immediate snapshot for this city
    const [weatherRes, airRes, exchangeRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`),
      fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${city.lat}&lon=${city.lon}&appid=${process.env.OPENWEATHER_API_KEY}`),
      fetch(`https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/${city.currency || "USD"}`)
    ]);

    const weather = await weatherRes.json();
    const air = await airRes.json();
    const exchange = await exchangeRes.json();
    const timestamp = new Date();
    
    const snapshot = {
      cityId: city.id,
      city: {
        id: city.id,
        name: city.name,
        country: city.country,
        latitude: city.lat,
        longitude: city.lon,
      },
      weather: {
        temperatureC: weather.main?.temp || 0,
        apparentTemperatureC: weather.main?.feels_like || 0,
        humidityPercent: weather.main?.humidity || 0,
        windKph: (weather.wind?.speed || 0) * 3.6,
        condition: weather.weather?.[0]?.main || "Unknown",
        observedAt: timestamp.toISOString(),
      },
      airQuality: {
        usAqi: AQI_MAP[air.list?.[0]?.main?.aqi] || 0,
        europeanAqi: AQI_MAP[air.list?.[0]?.main?.aqi] || 0,
        pm25: air.list?.[0]?.components?.pm2_5 || 0,
        pm10: air.list?.[0]?.components?.pm10 || 0,
        nitrogenDioxide: air.list?.[0]?.components?.no2 || 0,
        ozone: air.list?.[0]?.components?.o3 || 0,
        carbonMonoxide: air.list?.[0]?.components?.co || 0,
        observedAt: timestamp.toISOString(),
      },
      population: { value: city.pop || 0 },
      currency: {
        code: city.currency || "USD",
        inrPerCurrencyUnit: exchange.conversion_rates?.INR || null,
        updatedAt: timestamp.toISOString(),
      },
      updatedAt: timestamp.toISOString(),
      errors: [],
    };

    const { collection } = await getCollection();
    await collection.insertOne(snapshot);

    return Response.json({ success: true, message: "City tracked successfully" });
  } catch (error) {
    console.error("City Track API Error:", error);
    return Response.json({ error: "Failed to track city" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Missing city id" }, { status: 400 });
    }

    await connectMongo();
    
    // Remove from tracked cities
    await TrackedCity.deleteOne({ id });

    return Response.json({ success: true, message: "City untracked successfully" });
  } catch (error) {
    console.error("City Untrack API Error:", error);
    return Response.json({ error: "Failed to untrack city" }, { status: 500 });
  }
}
