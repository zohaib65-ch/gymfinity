import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db";

// PUT /api/plans/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await dbService.getPlanById(id);
    if (!existing) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const updated = await dbService.updatePlan(id, body);
    return NextResponse.json({ plan: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update plan" },
      { status: 500 }
    );
  }
}

// DELETE /api/plans/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await dbService.getPlanById(id);
    if (!existing) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const success = await dbService.deletePlan(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete plan" },
      { status: 500 }
    );
  }
}
