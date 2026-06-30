import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db";

// GET /api/plans
export async function GET(req: NextRequest) {
  try {
    const plans = await dbService.getPlans();
    return NextResponse.json({ plans });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load membership plans" },
      { status: 500 }
    );
  }
}

// POST /api/plans
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, duration, price, description, benefits } = body;

    if (!name || !duration || price === undefined) {
      return NextResponse.json(
        { error: "Name, duration, and price are required" },
        { status: 400 }
      );
    }

    const newPlan = await dbService.createPlan({
      name,
      duration: parseInt(duration),
      price: parseFloat(price),
      description: description || "",
      benefits: Array.isArray(benefits) ? benefits : [],
      isActive: true,
    });

    return NextResponse.json({ plan: newPlan });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create plan" },
      { status: 500 }
    );
  }
}
