import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db";

// PUT /api/payments/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await dbService.updatePayment(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({ payment: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update payment" },
      { status: 500 }
    );
  }
}
