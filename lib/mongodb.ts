import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (!uri) {
    throw new Error(
      "MONGODB_URI environment variable is not defined. Please configure it in your Settings."
    );
  }

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri);

  await client.connect();
  
  // Extract database name from connection string if possible, default to "gymfinity"
  let dbName = "gymfinity";
  try {
    const cleanUri = uri.split("?")[0];
    const parts = cleanUri.split("/");
    const lastPart = parts[parts.length - 1];
    if (lastPart) {
      dbName = lastPart;
    }
  } catch (e) {
    console.error("Failed to parse DB name from MONGODB_URI, using default 'gymfinity'", e);
  }

  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
