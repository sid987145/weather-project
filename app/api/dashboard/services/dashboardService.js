import { AQI_MAP } from "../constants";
import { CITIES as DEFAULT_CITIES } from "../cities";
import connectMongo from "../../../../lib/mongodb";
import TrackedCity from "../../../../lib/models/TrackedCity";

export async function fetchLatestSnapshots() {
  await connectMongo();
  let CITIES = await TrackedCity.find({}).lean();

  if (!CITIES || CITIES.length === 0) {
    await TrackedCity.insertMany(DEFAULT_CITIES);
    CITIES = await TrackedCity.find({}).lean();
  }

  const snapshots = [];

  for (const city of CITIES) {
    try {
      const [weatherRes, airRes, exchangeRes] =
        await Promise.all([
          fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
          ),
          fetch(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${city.lat}&lon=${city.lon}&appid=${process.env.OPENWEATHER_API_KEY}`
          ),
          fetch(
            `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/${city.currency}`
          ),
        ]);

      const weather = await weatherRes.json();
      const air = await airRes.json();
      const exchange = await exchangeRes.json();

      const timestamp = new Date();

      snapshots.push({
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
        population: {
          value: city.pop,
        },
        currency: {
          code: city.currency,
          inrPerCurrencyUnit:
            exchange.conversion_rates?.INR || null,
          updatedAt: timestamp.toISOString(),
        },
        updatedAt: timestamp.toISOString(),
        errors: [],
      });
    } catch (error) {
      console.error(`Error fetching ${city.name}`, error);
    }
  }

  return snapshots;
}