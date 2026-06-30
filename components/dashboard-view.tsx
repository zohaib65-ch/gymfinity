"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Users,
  Activity,
  DollarSign,
  UserCheck,
  CheckCircle,
  AlertCircle,
  Search,
  LogIn,
  LogOut,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import {
  getMembers,
  getPayments,
  getAttendance,
  saveAttendance,
  Member,
  Attendance,
  checkMongoDBConnection,
} from "@/lib/db";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function DashboardView() {
  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [payments, setPayments] = useState([]);
  const [dbConnected, setDbConnected] = useState(false);
  
  // Quick Check-in states
  const [checkInQuery, setCheckInQuery] = useState("");
  const [checkInResult, setCheckInResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    getMembers().then((data) => {
      setMembers(data);
      setDbConnected(checkMongoDBConnection());
    });
    getAttendance().then(setAttendance);
    getPayments().then((data) => setPayments(data as any));
  }, []);

  // Compute stats
  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === "Active").length;
  
  // Total Revenue this month (June 2026)
  const totalRevenue = payments
    .filter((p: any) => p.status === "Paid" && p.paymentDate && p.paymentDate.includes("2026-06"))
    .reduce((sum: number, p: any) => sum + p.amount, 0);

  // Today's Date
  const todayDate = "2026-06-30";
  const todayAttendanceList = attendance.filter((a) => a.date === todayDate);
  const todayAttendanceCount = todayAttendanceList.length;

  // Recharts Revenue Chart Data
  const chartData = [
    { name: "Jan", Revenue: 2100 },
    { name: "Feb", Revenue: 2400 },
    { name: "Mar", Revenue: 3100 },
    { name: "Apr", Revenue: 2900 },
    { name: "May", Revenue: 4200 },
    { name: "Jun", Revenue: totalRevenue || 3800 },
  ];

  // Handle Quick Member Check-In
  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInQuery.trim()) return;

    const trimmed = checkInQuery.trim().toLowerCase();
    
    // Find member by ID, QR Code, Name, or Email
    const member = members.find(
      (m) =>
        m.id.toLowerCase() === trimmed ||
        (m.qrCode && m.qrCode.toLowerCase() === trimmed) ||
        m.name.toLowerCase().includes(trimmed) ||
        m.email.toLowerCase().includes(trimmed)
    );

    if (!member) {
      setCheckInResult({
        success: false,
        message: "No registered gym member matches that query.",
      });
      return;
    }

    if (member.status !== "Active") {
      setCheckInResult({
        success: false,
        message: `Check-in denied. ${member.name}'s membership is ${member.status}.`,
      });
      return;
    }

    // Check if already checked in today and not checked out
    const alreadyCheckedIn = attendance.find(
      (a) => a.memberId === member.id && a.date === todayDate && !a.checkOutTime
    );

    if (alreadyCheckedIn) {
      setCheckInResult({
        success: false,
        message: `${member.name} is already checked in today since ${alreadyCheckedIn.checkInTime}.`,
      });
      return;
    }

    // Success Check-in
    const newRecord: Attendance = {
      id: `att-${Date.now()}`,
      memberId: member.id,
      memberName: member.name,
      checkInTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: todayDate,
    };

    const updatedAttendance = [newRecord, ...attendance];
    setAttendance(updatedAttendance);
    saveAttendance(updatedAttendance);

    setCheckInResult({
      success: true,
      message: `${member.name} checked in successfully! QR Code authorized.`,
    });
    setCheckInQuery("");

    // Auto-clear result after 5 seconds
    setTimeout(() => setCheckInResult(null), 5000);
  };

  // Handle Checkout
  const handleCheckOut = (attId: string) => {
    const updated = attendance.map((a) => {
      if (a.id === attId) {
        return {
          ...a,
          checkOutTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      }
      return a;
    });
    setAttendance(updated);
    saveAttendance(updated);
  };

  const stats = [
    {
      name: "Total Gym Members",
      value: totalMembers,
      change: "+12% this month",
      icon: Users,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      borderColor: "border-blue-100",
    },
    {
      name: "Active Memberships",
      value: activeMembers,
      change: `${Math.round((activeMembers / totalMembers) * 100)}% active rate`,
      icon: Activity,
      color: "bg-emerald-500",
      textColor: "text-emerald-600",
      borderColor: "border-emerald-100",
    },
    {
      name: "June Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      change: "+18.4% vs last month",
      icon: DollarSign,
      color: "bg-indigo-500",
      textColor: "text-indigo-600",
      borderColor: "border-indigo-100",
    },
    {
      name: "Today's Attendance",
      value: todayAttendanceCount,
      change: "Active check-ins at gate",
      icon: UserCheck,
      color: "bg-amber-500",
      textColor: "text-amber-600",
      borderColor: "border-amber-100",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in" id="dashboard-view-root">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Gym Workspace Overview
          </h1>
          <p className="text-slate-500 text-sm">
            Real-time insights and receptionist control tools for gate operations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-fit self-start md:self-auto">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm">
            <CalendarDays className="h-4 w-4 text-indigo-500" />
            <span>Operational Date: June 30, 2026</span>
          </div>
          
          <div className={`flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-bold shadow-sm ${
            dbConnected
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}>
            <span className={`h-2 w-2 rounded-full ${dbConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            <span>{dbConnected ? "MongoDB Connected" : "Local Demo Mode"}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            key={stat.name}
            className={`rounded-2xl border ${stat.borderColor} bg-white p-6 shadow-sm flex items-start justify-between`}
            id={`stat-card-${i}`}
          >
            <div className="space-y-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
                {stat.name}
              </span>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {stat.value}
              </h3>
              <p className={`text-xs font-medium ${stat.textColor}`}>
                {stat.change}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${stat.color} text-white shadow-sm`}>
              <stat.icon className="h-5 w-5" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Gate Check-In & Live Traffic */}
        <div className="lg:col-span-2 space-y-6">
          {/* Check-In Console */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase mb-4 flex items-center gap-2">
              <LogIn className="h-4 w-4 text-indigo-500" />
              Reception Desk Check-In Console
            </h3>
            
            <form onSubmit={handleCheckIn} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 h-5 w-5 my-auto" />
                <input
                  id="checkin-search-input"
                  type="text"
                  placeholder="Enter Member Name, ID, or QR Code (e.g. GYMF-9F91-C93E)"
                  value={checkInQuery}
                  onChange={(e) => setCheckInQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
              <button
                id="checkin-submit-btn"
                type="submit"
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all cursor-pointer whitespace-nowrap"
              >
                Scan QR Code / Check-In
              </button>
            </form>

            {checkInResult && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold border ${
                  checkInResult.success
                    ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                    : "bg-red-50 border-red-100 text-red-800"
                }`}
                id="checkin-alert"
              >
                {checkInResult.success ? (
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                )}
                <span>{checkInResult.message}</span>
              </motion.div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs text-slate-400 font-medium self-center">Quick Demo Shortcuts:</span>
              <button
                type="button"
                onClick={() => setCheckInQuery("GYMF-9F91-C93E")}
                className="px-2 py-1 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors"
              >
                Zohaib (Diamond)
              </button>
              <button
                type="button"
                onClick={() => setCheckInQuery("GYMF-883A-291B")}
                className="px-2 py-1 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors"
              >
                Ayesha (Gold)
              </button>
              <button
                type="button"
                onClick={() => setCheckInQuery("GYMF-739C-011D")}
                className="px-2 py-1 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors font-mono"
              >
                Expired Member
              </button>
            </div>
          </div>

          {/* Revenue Analytics Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-500" />
                Monthly Cash Flow Analytics
              </h3>
              <span className="text-xs font-semibold text-slate-400">Total in H1 2026</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      fontSize: "12px",
                      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
                    }}
                  />
                  <Area type="monotone" dataKey="Revenue" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Live Attendance Gate Logs */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col h-full max-h-[460px]">
          <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase mb-4 flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-indigo-500" />
            Live Gate Check-In Feed
          </h3>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {todayAttendanceList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center text-slate-400">
                <Users className="h-8 w-8 stroke-1 mb-2" />
                <p className="text-xs">No entries checked in yet today.</p>
              </div>
            ) : (
              todayAttendanceList.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-900">{log.memberName}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                      <span>Check-In: {log.checkInTime}</span>
                      {log.checkOutTime && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-600">Check-Out: {log.checkOutTime}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {!log.checkOutTime ? (
                    <button
                      id={`checkout-btn-${log.id}`}
                      type="button"
                      onClick={() => handleCheckOut(log.id)}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all cursor-pointer"
                    >
                      <LogOut className="h-3 w-3" />
                      Check Out
                    </button>
                  ) : (
                    <span className="rounded-lg bg-slate-200/50 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                      Completed
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
