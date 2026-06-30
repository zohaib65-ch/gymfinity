import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db";

// GET /api/customers
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";
    const plan = url.searchParams.get("plan") || "";

    let customers = await dbService.getCustomers();

    // Filter by search term (name, phone, or membershipId)
    if (search) {
      const term = search.toLowerCase();
      customers = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.phone.includes(term) ||
          c.membershipId.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (status) {
      customers = customers.filter((c) => c.status === status);
    }

    // Filter by plan
    if (plan) {
      customers = customers.filter((c) => c.currentPlanId === plan);
    }

    return NextResponse.json({ customers });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load customers" },
      { status: 500 }
    );
  }
}

// POST /api/customers - Enroll new member
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      phone,
      email,
      address,
      dob,
      gender,
      emergencyContact,
      planId,
      startDate,
      paymentMethod,
      amountPaid,
      status, // Optional, defaults to Active
      createdBy,
    } = body;

    // Validate required fields
    if (!name || !phone || !planId || !startDate) {
      return NextResponse.json(
        { error: "Name, phone, plan, and start date are required" },
        { status: 400 }
      );
    }

    // Fetch the membership plan
    const plan = await dbService.getPlanById(planId);
    if (!plan) {
      return NextResponse.json({ error: "Selected plan does not exist" }, { status: 404 });
    }

    // Calculate end date based on plan duration (in months)
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + plan.duration);
    const endDateStr = end.toISOString().split("T")[0];

    // Create the customer
    const newCustomer = await dbService.createCustomer({
      name,
      phone,
      email: email || "",
      address: address || "",
      dob: dob || "",
      gender: gender || "Other",
      emergencyContact: emergencyContact || { name: "", phone: "" },
      registrationDate: new Date().toISOString().split("T")[0],
      status: status || "Active",
      currentPlanId: planId,
      currentPlanName: plan.name,
      membershipStartDate: startDate,
      membershipEndDate: endDateStr,
    });

    // Handle Payment Entry
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
      customerId: newCustomer.id,
      customerName: newCustomer.name,
      planId: plan.id,
      planName: plan.name,
      amount: paid,
      paymentDate: startDate,
      paymentMethod: paymentMethod || "Cash",
      status: paymentStatus,
      balance: balance,
      createdBy: createdBy || "Staff",
    });

    // Create RenewalHistory / Enrollment history
    await dbService.createRenewal({
      customerId: newCustomer.id,
      type: "Enrollment",
      planId: plan.id,
      planName: plan.name,
      startDate: startDate,
      endDate: endDateStr,
      date: new Date().toISOString().split("T")[0],
      amountPaid: paid,
    });

    return NextResponse.json({
      customer: newCustomer,
      payment: newPayment,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create customer" },
      { status: 500 }
    );
  }
}
