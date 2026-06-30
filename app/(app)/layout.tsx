"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
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
} from "lucide-react";

const menuItems = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { id: "members", label: "Members Directory", icon: Users, href: "/members" },
  { id: "plans", label: "Membership Plans", icon: Layers, href: "/plans" },
  { id: "payments", label: "Payments & Invoices", icon: CreditCard, href: "/payments" },
  { id: "reports", label: "Financial Reports", icon: BarChart3, href: "/reports" },
] as const;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: string; name: string; username: string; role: string } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedUser = window.localStorage.getItem("gym_user_session");
    if (!savedUser) {
      router.replace("/login");
      return;
    }
    try {
      setUser(JSON.parse(savedUser));
    } catch {
      router.replace("/login");
    }
  }, [router]);

  const activeTab = pathname.split("/")[1] || "dashboard";

  const handleLogout = () => {
    window.localStorage.removeItem("gym_user_session");
    router.replace("/login");
  };

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:shrink-0 bg-slate-900 border-r border-slate-800 h-full">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center gap-3 h-16 px-6 border-b border-slate-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-base font-black tracking-widest text-white uppercase">GYMFINITY</h1>
              <p className="text-[10px] text-slate-500 font-extrabold tracking-wider uppercase">WORKSPACE</p>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                  }`}
                >
                  <item.icon className={`h-4.5 w-4.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800 bg-slate-950/40">
            <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-900/50 p-3 border border-slate-800/60">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-white truncate">{user.name}</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">System Admin</p>
              </div>
              <button
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

      {/* Main Content and Mobile Panel wrapper */}
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
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                      <Dumbbell className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black tracking-widest text-white uppercase">GYMFINITY</h2>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Mobile Portal</p>
                    </div>
                  </div>

                  <nav className="space-y-1.5">
                    {menuItems.map((item) => {
                      const isActive = activeTab === item.id;
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                            isActive ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800"
                          }`}
                        >
                          <item.icon className="h-4.5 w-4.5" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                <div className="border-t border-slate-800 pt-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                    <div className="truncate">
                      <p className="text-xs font-extrabold text-white truncate">{user.name}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">System Admin</p>
                    </div>
                    <button
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

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
