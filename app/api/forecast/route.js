export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
      return Response.json({ error: "Missing lat/lon" }, { status: 400 });
    }

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch forecast from OpenWeather");
    }

    const data = await res.json();
    
    // Group the 3-hour forecasts by day
    const dailyForecasts = {};

    for (const item of data.list) {
      const date = item.dt_txt.split(" ")[0]; // YYYY-MM-DD
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date,
          temp_max: item.main.temp_max,
          temp_min: item.main.temp_min,
          conditions: [item.weather[0].main], // Store all conditions to find most common
          icon: item.weather[0].icon,
        };
      } else {
        dailyForecasts[date].temp_max = Math.max(dailyForecasts[date].temp_max, item.main.temp_max);
        dailyForecasts[date].temp_min = Math.min(dailyForecasts[date].temp_min, item.main.temp_min);
        dailyForecasts[date].conditions.push(item.weather[0].main);
        // Use mid-day icon
        if (item.dt_txt.includes("12:00:00")) {
          dailyForecasts[date].icon = item.weather[0].icon;
        }
      }
    }

    // Process conditions to find dominant
    const processedForecasts = Object.values(dailyForecasts).map(day => {
      const counts = {};
      let maxCount = 0;
      let dominantCondition = day.conditions[0];
      for (const cond of day.conditions) {
        counts[cond] = (counts[cond] || 0) + 1;
        if (counts[cond] > maxCount) {
          maxCount = counts[cond];
          dominantCondition = cond;
        }
      }
      return {
        date: day.date,
        temp_max: day.temp_max,
        temp_min: day.temp_min,
        condition: dominantCondition,
        icon: day.icon,
      };
    });

    // Take up to 5 days
    const next5Days = processedForecasts.slice(0, 5);

    return Response.json({ forecast: next5Days });
  } catch (error) {
    console.error("Forecast API Error:", error);
    return Response.json({ error: "Failed to fetch forecast" }, { status: 500 });
  }
}
