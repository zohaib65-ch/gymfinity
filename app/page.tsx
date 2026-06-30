"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Users,
  Layers,
  CreditCard,
  BarChart3,
  LogOut,
  Menu,
  X,
  Dumbbell,
  Sparkles,
} from "lucide-react";

// Components
import LoginPanel from "@/components/login-panel";
import DashboardView from "@/components/dashboard-view";
import MembersView from "@/components/members-view";
import PlansView from "@/components/plans-view";
import PaymentsView from "@/components/payments-view";
import ReportsView from "@/components/reports-view";

type Tab = "dashboard" | "members" | "plans" | "payments" | "reports";

interface UserSession {
  id: string;
  name: string;
  username: string;
  role: "admin";
}

export default function Home() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Read session from localStorage on mount
  useEffect(() => {
    const savedUser = window.localStorage.getItem("gym_user_session");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to restore session", e);
      }
    }
  }, []);

  const handleLoginSuccess = (session: UserSession) => {
    setUser(session);
    window.localStorage.setItem("gym_user_session", JSON.stringify(session));
  };

  const handleLogout = () => {
    setUser(null);
    window.localStorage.removeItem("gym_user_session");
  };

  const menuItems = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "members", label: "Members Directory", icon: Users },
    { id: "plans", label: "Membership Plans", icon: Layers },
    { id: "payments", label: "Payments & Invoices", icon: CreditCard },
    { id: "reports", label: "Financial Reports", icon: BarChart3 },
  ] as const;

  if (!user) {
    return <LoginPanel onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50" id="gymfinity-workspace-root">
      {/* 1. Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:shrink-0 bg-slate-900 border-r border-slate-800 h-full">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Sidebar Gymfinity Barbell Logo */}
          <div className="flex items-center gap-3 h-16 px-6 border-b border-slate-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-base font-black tracking-widest text-white uppercase">GYMFINITY</h1>
              <p className="text-[10px] text-slate-500 font-extrabold tracking-wider uppercase">WORKSPACE</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  id={`sidebar-tab-${item.id}`}
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                  }`}
                >
                  <item.icon className={`h-4.5 w-4.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Profile Bar / Sign Out */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/40">
            <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-900/50 p-3 border border-slate-800/60">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-white truncate">{user.name}</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">System Admin</p>
              </div>
              <button
                id="sidebar-signout-btn"
                onClick={handleLogout}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Content and Mobile Panel wrapper */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="flex lg:hidden items-center justify-between h-16 px-4 bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Dumbbell className="h-4 w-4" />
            </div>
            <span className="text-sm font-black tracking-widest text-white uppercase">GYMFINITY</span>
          </div>

          <button
            id="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Mobile slide-out overlay drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
                className="w-72 bg-slate-900 border-r border-slate-800 h-full flex flex-col justify-between p-6"
              >
                <div className="space-y-6">
                  {/* Drawer Logo */}
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                      <Dumbbell className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black tracking-widest text-white uppercase">GYMFINITY</h2>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Mobile Portal</p>
                    </div>
                  </div>

                  {/* Drawer Navigation */}
                  <nav className="space-y-1.5">
                    {menuItems.map((item) => {
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          id={`mobile-drawer-tab-${item.id}`}
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                            isActive ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800"
                          }`}
                        >
                          <item.icon className="h-4.5 w-4.5" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Profile Drawer footer */}
                <div className="border-t border-slate-800 pt-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                    <div className="truncate">
                      <p className="text-xs font-extrabold text-white truncate">{user.name}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">System Admin</p>
                    </div>
                    <button
                      id="mobile-drawer-signout-btn"
                      onClick={handleLogout}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-white cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. Main Dynamic Panel Content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {activeTab === "dashboard" && <DashboardView />}
            {activeTab === "members" && <MembersView />}
            {activeTab === "plans" && <PlansView />}
            {activeTab === "payments" && <PaymentsView />}
            {activeTab === "reports" && <ReportsView />}
          </div>
        </main>
      </div>
    </div>
  );
}
