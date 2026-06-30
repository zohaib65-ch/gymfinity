import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db";

// GET /api/payments
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const customerId = url.searchParams.get("customerId") || "";
    const status = url.searchParams.get("status") || "";
    const startDate = url.searchParams.get("startDate") || "";
    const endDate = url.searchParams.get("endDate") || "";

    let payments = await dbService.getPayments();

    if (customerId) {
      payments = payments.filter((p) => p.customerId === customerId);
    }

    if (status) {
      payments = payments.filter((p) => p.status === status);
    }

    if (startDate) {
      payments = payments.filter((p) => p.paymentDate >= startDate);
    }

    if (endDate) {
      payments = payments.filter((p) => p.paymentDate <= endDate);
    }

    // Sort by date descending
    payments.sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));

    return NextResponse.json({ payments });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load payments" },
      { status: 500 }
    );
  }
}

// POST /api/payments - Add manual payment or settle outstanding balance
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerId,
      customerName,
      planId,
      planName,
      amount,
      paymentMethod,
      paymentDate,
      createdBy,
      status,
      balance,
    } = body;

    if (!customerId || !amount) {
      return NextResponse.json(
        { error: "Customer ID and amount are required" },
        { status: 400 }
      );
    }

    const newPayment = await dbService.createPayment({
      customerId,
      customerName: customerName || "Member",
      planId: planId || "plan-manual",
      planName: planName || "Custom Payment",
      amount: parseFloat(amount),
      paymentDate: paymentDate || new Date().toISOString().split("T")[0],
      paymentMethod: paymentMethod || "Cash",
      status: status || "Paid",
      balance: balance !== undefined ? parseFloat(balance) : 0,
      createdBy: createdBy || "Staff",
    });

    return NextResponse.json({ payment: newPayment });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to log payment" },
      { status: 500 }
    );
  }
}
