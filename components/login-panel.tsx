"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Dumbbell, Eye, EyeOff, Lock, User as UserIcon, Loader2 } from "lucide-react";

interface LoginPanelProps {
  onLoginSuccess: (user: { id: string; name: string; username: string; role: "admin" }) => void;
}

export default function LoginPanel({ onLoginSuccess }: LoginPanelProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulate network delay for extreme polish
    setTimeout(() => {
      const trimmedUser = username.trim().toLowerCase();
      if ((trimmedUser === "admin" && password === "admin123") || (!username && !password)) {
        // Successful login as Unified Admin
        onLoginSuccess({
          id: "user-admin",
          name: "Chaudhry Zohaib (Admin)",
          username: "admin",
          role: "admin",
        });
      } else {
        setError("Invalid username or password. Use demo access below or 'admin' / 'admin123'.");
        setIsLoading(false);
      }
    }, 800);
  };

  const handleQuickDemo = () => {
    setUsername("admin");
    setPassword("admin123");
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      onLoginSuccess({
        id: "user-admin",
        name: "Chaudhry Zohaib (Admin)",
        username: "admin",
        role: "admin",
      });
    }, 600);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md space-y-8"
        id="login-card-container"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <Dumbbell className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900">
            Gymfinity
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Gym Management System Admin Portal
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-100"
                id="login-error-alert"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <input
                    id="username-input"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="Enter admin"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password-input"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-12 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    id="password-toggle-btn"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-xl bg-indigo-600 py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-medium">Demo Access</span>
            </div>
          </div>

          <button
            id="demo-login-btn"
            type="button"
            onClick={handleQuickDemo}
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50/50 py-3 px-4 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 hover:border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all cursor-pointer"
          >
            1-Click Admin Access
          </button>
          
          <div className="mt-4 text-center text-xs text-slate-400 font-mono">
            Default credentials: admin / admin123
          </div>
        </div>
      </motion.div>
    </div>
  );
}
