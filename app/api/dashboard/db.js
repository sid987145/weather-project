import { MongoClient } from "mongodb";

let client;
let clientPromise;

function getClientPromise() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }

  if (!clientPromise) {
    client = new MongoClient(uri);
    clientPromise = client.connect();
  }
  return clientPromise;
}

export async function getCollection() {
  const connectedClient = await getClientPromise();
  const db = connectedClient.db("weather_dashboard");

  return {
    client: connectedClient,
    collection: db.collection("city_snapshots"),
  };
}