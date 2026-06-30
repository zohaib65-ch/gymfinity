import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db";

// GET /api/renewals - Get full renewal history log
export async function GET(req: NextRequest) {
  try {
    const renewals = await dbService.getRenewals();
    return NextResponse.json({ renewals });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load renewals" },
      { status: 500 }
    );
  }
}

// POST /api/renewals - Perform customer renewal
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerId,
      planId,
      startDate,
      paymentMethod,
      amountPaid,
      createdBy,
    } = body;

    if (!customerId || !planId || !startDate) {
      return NextResponse.json(
        { error: "Customer ID, Plan ID, and Start Date are required" },
        { status: 400 }
      );
    }

    // 1. Fetch customer and plan
    const customer = await dbService.getCustomerById(customerId);
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const plan = await dbService.getPlanById(planId);
    if (!plan) {
      return NextResponse.json({ error: "Membership plan not found" }, { status: 404 });
    }

    // 2. Calculate new membership end date
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + plan.duration);
    const endDateStr = end.toISOString().split("T")[0];

    // 3. Update customer membership details and status
    const oldPlanId = customer.currentPlanId || null;
    const updatedCustomer = await dbService.updateCustomer(customerId, {
      currentPlanId: planId,
      currentPlanName: plan.name,
      membershipStartDate: startDate,
      membershipEndDate: endDateStr,
      status: "Active", // renewed members become Active
    });

    // 4. Handle Payment record
    const totalAmount = plan.price;
    const paid = parseFloat(amountPaid) || 0;
    const balance = Math.max(0, totalAmount - paid);

    let paymentStatus: "Paid" | "Partial" | "Pending" = "Pending";
    if (paid >= totalAmount) {
      paymentStatus = "Paid";
    } else if (paid > 0) {
      paymentStatus = "Partial";
    }

    const newPayment = await dbService.createPayment({
      customerId: customer.id,
      customerName: customer.name,
      planId: plan.id,
      planName: plan.name,
      amount: paid,
      paymentDate: startDate,
      paymentMethod: paymentMethod || "Cash",
      status: paymentStatus,
      balance: balance,
      createdBy: createdBy || "Staff",
    });

    // 5. Create RenewalHistory event record
    const renewalHistory = await dbService.createRenewal({
      customerId: customer.id,
      type: "Renewal",
      planId: plan.id,
      planName: plan.name,
      startDate: startDate,
      endDate: endDateStr,
      date: new Date().toISOString().split("T")[0],
      amountPaid: paid,
    });

    return NextResponse.json({
      customer: updatedCustomer,
      payment: newPayment,
      renewal: renewalHistory,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to renew membership" },
      { status: 500 }
    );
  }
}
