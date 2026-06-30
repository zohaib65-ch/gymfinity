import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db";

// GET /api/customers/[id] - View Profile & History
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customer = await dbService.getCustomerById(id);
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Load payments for this customer
    const allPayments = await dbService.getPayments();
    const customerPayments = allPayments.filter((p) => p.customerId === id);

    // Load renewals history
    const allRenewals = await dbService.getRenewals();
    const customerRenewals = allRenewals.filter((r) => r.customerId === id);

    return NextResponse.json({
      customer,
      payments: customerPayments,
      renewals: customerRenewals,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load customer details" },
      { status: 500 }
    );
  }
}

// PUT /api/customers/[id] - Edit member details
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await dbService.getCustomerById(id);
    if (!existing) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const updated = await dbService.updateCustomer(id, body);
    return NextResponse.json({ customer: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update customer" },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/[id] - Remove customer
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const existing = await dbService.getCustomerById(id);
    if (!existing) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const success = await dbService.deleteCustomer(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete customer" },
      { status: 500 }
    );
  }
}
