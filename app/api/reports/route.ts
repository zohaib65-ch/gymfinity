import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const payments = await dbService.getPayments();
    const customers = await dbService.getCustomers();
    const plans = await dbService.getPlans();

    // Get today's date in YYYY-MM-DD
    const todayStr = new Date().toISOString().split("T")[0];
    
    // Get current month in YYYY-MM
    const currentMonthStr = todayStr.substring(0, 7); // e.g., "2026-06"

    // 1. Daily Income Report
    const dailyPayments = payments.filter((p) => p.paymentDate === todayStr);
    const dailyIncome = dailyPayments.reduce((sum, p) => sum + p.amount, 0);

    // 2. Monthly Income Report
    const monthlyPayments = payments.filter((p) => p.paymentDate.startsWith(currentMonthStr));
    const monthlyIncome = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);

    // 3. Revenue by Plan
    const planRevenue: { [key: string]: { name: string; count: number; total: number } } = {};
    
    // Initialize with active plans
    plans.forEach((p) => {
      planRevenue[p.id] = { name: p.name, count: 0, total: 0 };
    });
    // Add a manual/fallback bucket just in case
    planRevenue["plan-manual"] = { name: "Other / Manual", count: 0, total: 0 };

    payments.forEach((p) => {
      const pId = p.planId || "plan-manual";
      if (!planRevenue[pId]) {
        planRevenue[pId] = { name: p.planName || "Other", count: 0, total: 0 };
      }
      planRevenue[pId].count += 1;
      planRevenue[pId].total += p.amount;
    });

    // 4. Outstanding Balance Report
    // Filter payments with balance > 0
    const unpaidPayments = payments.filter((p) => p.balance > 0);
    const totalOutstanding = unpaidPayments.reduce((sum, p) => sum + p.balance, 0);

    // 5. Overall statistics
    const totalMembers = customers.length;
    const activeMembers = customers.filter((c) => c.status === "Active").length;
    const expiredMembers = customers.filter((c) => c.status === "Expired").length;
    const pendingRenewals = customers.filter((c) => c.status === "Pending Renewal").length;
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      summary: {
        totalMembers,
        activeMembers,
        expiredMembers,
        pendingRenewals,
        todayIncome: dailyIncome,
        monthlyRevenue: monthlyIncome,
        totalRevenue,
        totalOutstanding,
        isRealMongo: dbService.isUsingRealMongo(),
      },
      dailyReport: {
        date: todayStr,
        total: dailyIncome,
        transactions: dailyPayments,
      },
      monthlyReport: {
        month: currentMonthStr,
        total: monthlyIncome,
        transactions: monthlyPayments,
      },
      planRevenue: Object.values(planRevenue),
      outstandingReport: {
        total: totalOutstanding,
        transactions: unpaidPayments,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to compile financial reports" },
      { status: 500 }
    );
  }
}
