import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Gymfinity - Gym Management System",
  description: "Advanced gym member, subscription, and payments portal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500/10 selection:text-indigo-600">
        {children}
      </body>
    </html>
  );
}
