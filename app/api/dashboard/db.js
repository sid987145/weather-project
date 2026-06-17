import { MongoClient } from "mongodb";

export async function getCollection() {
  const client = new MongoClient(process.env.MONGODB_URI);

  await client.connect();

  const db = client.db("weather_dashboard");

  return {
    client,
    collection: db.collection("city_snapshots"),
  };
}