export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return Response.json({ cities: [] });
    }

    const response = await fetch(
      `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(query)}&limit=10&sort=-population`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.GEODB_API_KEY,
          "X-RapidAPI-Host": process.env.GEODB_API_HOST,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GeoDB returned ${response.status}`);
    }

    const data = await response.json();
    
    // Map response to our expected format
    const suggestions = (data.data || []).map((city) => ({
      id: city.id ? String(city.id) : city.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      name: city.name,
      country: city.country,
      lat: city.latitude,
      lon: city.longitude,
      pop: city.population || 0,
      currency: "USD", 
    }));

    return Response.json({ cities: suggestions });
  } catch (error) {
    console.error("City Search API Error:", error);
    return Response.json({ error: "Failed to search cities" }, { status: 500 });
  }
}
