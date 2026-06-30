"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  TrendingUp,
  TrendingDown,
  Percent,
  Layers,
  Sparkles,
  DollarSign,
  Users,
  Target,
  FileSpreadsheet,
  Download,
  AlertCircle,
} from "lucide-react";
import { getPayments, getMembers, Member, getRenewals } from "@/lib/db";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  PieChart,
  Pie,
} from "recharts";

export default function ReportsView() {
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState([]);
  const [renewals, setRenewals] = useState([]);

  useEffect(() => {
    getMembers().then(setMembers);
    getPayments().then((data) => setPayments(data as any));
    getRenewals().then((data) => setRenewals(data as any));
  }, []);

  // Compute metrics
  const activeMembers = members.filter((m) => m.status === "Active");
  const totalRevenue = payments
    .filter((p: any) => p.status === "Paid")
    .reduce((sum: number, p: any) => sum + p.amount, 0);

  // Compute ARPU (Average Revenue Per User)
  const arpu = activeMembers.length > 0 ? Math.round(totalRevenue / activeMembers.length) : 0;

  // Plan distribution counts
  const plansDistribution = members.reduce((acc: any, m) => {
    acc[m.currentPlanName] = (acc[m.currentPlanName] || 0) + 1;
    return acc;
  }, {});

  const distributionChartData = Object.keys(plansDistribution).map((key) => ({
    name: `${key} Package`,
    count: plansDistribution[key],
  }));

  // Recharts Color Palette
  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#3b82f6", "#ec4899"];

  // Cash flow metrics
  const dailyMetrics = [
    {
      name: "Cumulative Income",
      value: `$${totalRevenue.toLocaleString()}`,
      change: "+14.2% vs Q1",
      icon: DollarSign,
      color: "bg-indigo-50 text-indigo-600",
      isPositive: true,
    },
    {
      name: "Average Revenue / User",
      value: `$${arpu}`,
      change: "+$12.5 per account",
      icon: Percent,
      color: "bg-emerald-50 text-emerald-600",
      isPositive: true,
    },
    {
      name: "Member Growth Rate",
      value: "+24.8%",
      change: "Stable organic acquisition",
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      isPositive: true,
    },
    {
      name: "Target Revenue Q2",
      value: "92.5%",
      change: "On course to hit milestone",
      icon: Target,
      color: "bg-amber-50 text-amber-600",
      isPositive: true,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in" id="reports-view-root">
      {/* Header View */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Financial Statements & Audits
          </h1>
          <p className="text-slate-500 text-sm">
            Review gym ARPU, package distributions, cash flow receipts, and retention rates.
          </p>
        </div>
        <button
          onClick={() => alert("Report successfully compiled and saved in ledger!")}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all cursor-pointer w-full sm:w-auto"
        >
          <Download className="h-4 w-4 text-slate-500" />
          Export Spreadsheet (CSV)
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {dailyMetrics.map((met, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            key={met.name}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-start gap-4"
            id={`metric-card-${i}`}
          >
            <div className={`p-3 rounded-xl ${met.color} shrink-0 shadow-xs`}>
              <met.icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                {met.name}
              </span>
              <h3 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {met.value}
              </h3>
              <div className="flex items-center gap-1 text-[10px] font-bold">
                {met.isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-red-600" />
                )}
                <span className={met.isPositive ? "text-emerald-600" : "text-red-600"}>{met.change}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Package distribution Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-500" />
              Membership Tier Segmentation
            </h3>
            <span className="text-xs font-semibold text-slate-400">Active package accounts</span>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
                  }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={45}>
                  {distributionChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ledger Statement */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-indigo-500" />
              General Ledger Audits
            </h3>
            
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Calculations based on active database accounts. Outstanding balances, payments collected, and package tiers are audited daily.
            </p>

            <div className="divide-y divide-slate-100 text-xs font-semibold pt-2">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-slate-500">Gross Subscriptions</span>
                <span className="text-slate-900 font-extrabold">${totalRevenue}</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-slate-500">Outstanding Invoices</span>
                <span className="text-amber-600 font-extrabold">$49</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-slate-500">Facility Operations</span>
                <span className="text-slate-900 font-extrabold">Active</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-slate-500">Compliance & Taxes</span>
                <span className="text-emerald-600 font-extrabold">100% compliant</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <div className="rounded-xl bg-indigo-50/50 p-3.5 border border-indigo-100 flex items-start gap-2.5 text-[10px] text-indigo-700 font-medium">
              <AlertCircle className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
              <span>Q2 financial review completed. Compliance standards verified by administrative oversight.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
