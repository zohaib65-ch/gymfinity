import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import {
  INITIAL_PLANS,
  INITIAL_MEMBERS,
  INITIAL_PAYMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_RENEWALS,
} from "@/lib/initial-data";

// Helper to get initial seed data for a collection
function getInitialData(collectionName: string) {
  switch (collectionName) {
    case "plans":
      return INITIAL_PLANS;
    case "members":
      return INITIAL_MEMBERS;
    case "payments":
      return INITIAL_PAYMENTS;
    case "attendance":
      return INITIAL_ATTENDANCE;
    case "renewals":
      return INITIAL_RENEWALS;
    default:
      return [];
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: "MONGODB_URI_NOT_CONFIGURED", message: "MONGODB_URI is not defined. Using local fallback storage." },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(req.url);
    const collectionName = searchParams.get("collection");

    if (!collectionName) {
      return NextResponse.json({ error: "Missing 'collection' query parameter" }, { status: 400 });
    }

    const validCollections = ["plans", "members", "payments", "attendance", "renewals"];
    if (!validCollections.includes(collectionName)) {
      return NextResponse.json({ error: "Invalid collection name" }, { status: 400 });
    }

    // Connect to database
    const { db } = await connectToDatabase();
    const collection = db.collection(collectionName);

    // Retrieve documents
    let items = await collection.find({}).toArray();

    // Auto-seed if the collection is empty
    if (items.length === 0) {
      const initialSeed = getInitialData(collectionName);
      if (initialSeed.length > 0) {
        await collection.insertMany(initialSeed);
        items = await collection.find({}).toArray();
      }
    }

    // Strip MongoDB _id to avoid type mismatches on the client side
    const cleanItems = items.map(({ _id, ...rest }) => rest);

    return NextResponse.json(cleanItems);
  } catch (error: any) {
    console.error("GET API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: "MONGODB_URI_NOT_CONFIGURED", message: "MONGODB_URI is not defined. Using local fallback storage." },
        { status: 503 }
      );
    }

    const { collection: collectionName, data } = await req.json();

    if (!collectionName || !Array.isArray(data)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const validCollections = ["plans", "members", "payments", "attendance", "renewals"];
    if (!validCollections.includes(collectionName)) {
      return NextResponse.json({ error: "Invalid collection name" }, { status: 400 });
    }

    // Connect to database
    const { db } = await connectToDatabase();
    const collection = db.collection(collectionName);

    // Clean data: remove any incoming _id to avoid insert/upsert issues
    const cleanData = data.map(({ _id, ...rest }) => rest);

    // Perform atomic replace-all (delete old, insert new)
    await collection.deleteMany({});
    if (cleanData.length > 0) {
      await collection.insertMany(cleanData);
    }

    return NextResponse.json({ success: true, count: cleanData.length });
  } catch (error: any) {
    console.error("POST API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save data" },
      { status: 500 }
    );
  }
}
