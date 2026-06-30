"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  DollarSign,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Receipt,
  Printer,
  ChevronRight,
  CreditCard,
  Building,
  Briefcase,
  X,
} from "lucide-react";
import { getPayments, savePayments, Payment, getMembers, Member } from "@/lib/db";

export default function PaymentsView() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Paid" | "Pending">("All");
  
  // Interactive Modal states
  const [selectedInvoice, setSelectedInvoice] = useState<Payment | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isCollectOpen, setIsCollectOpen] = useState(false);
  
  // Collect Payment Form states
  const [collectAmount, setCollectAmount] = useState("");
  const [collectMethod, setCollectMethod] = useState("Credit Card");

  useEffect(() => {
    getPayments().then(setPayments);
  }, []);

  const filteredPayments = payments.filter((pay) => {
    const matchesSearch =
      pay.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pay.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pay.planName.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === "All" || pay.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Open Collect Payment Panel
  const openCollectPayment = (pay: Payment) => {
    setSelectedInvoice(pay);
    setCollectAmount(pay.balance.toString());
    setIsCollectOpen(true);
  };

  // Submit collected payment
  const handleCollectPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !collectAmount) return;

    const parsedAmount = parseFloat(collectAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const updated = payments.map((p) => {
      if (p.id === selectedInvoice.id) {
        const nextBalance = Math.max(0, p.balance - parsedAmount);
        const nextStatus = nextBalance === 0 ? "Paid" : "Partial";
        return {
          ...p,
          balance: nextBalance,
          status: nextStatus as "Paid" | "Partial" | "Pending",
          paymentDate: new Date().toISOString().split("T")[0],
          paymentMethod: collectMethod,
        };
      }
      return p;
    });

    setPayments(updated);
    savePayments(updated);
    setIsCollectOpen(false);
    setSelectedInvoice(null);
  };

  const openInvoiceSheet = (pay: Payment) => {
    setSelectedInvoice(pay);
    setIsInvoiceOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="payments-view-root">
      {/* Header Panel */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Financial Invoicing & Payments
        </h1>
        <p className="text-slate-500 text-sm">
          Collect dues, audit member transactions, and print official gym receipts.
        </p>
      </div>

      {/* Directory & Actions Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 h-5 w-5 my-auto" />
          <input
            id="invoice-search"
            type="text"
            placeholder="Search by Invoice #, Member Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Filters Group */}
        <div className="flex rounded-lg bg-slate-100 p-1 text-slate-600 border border-slate-100 self-start sm:self-auto">
          {(["All", "Paid", "Pending"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`rounded-md px-4 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === filter
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List Board */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">Invoice #</th>
                <th className="p-4">Member Name</th>
                <th className="p-4">Package</th>
                <th className="p-4">Billed Date</th>
                <th className="p-4">Paid Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <Receipt className="mx-auto h-10 w-10 stroke-1 mb-2 text-slate-300" />
                    <p className="font-semibold">No invoice statements match filters.</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900">{pay.invoiceNumber}</td>
                    <td className="p-4 text-slate-900 font-semibold">{pay.memberName}</td>
                    <td className="p-4">{pay.planName} Plan</td>
                    <td className="p-4">{pay.billingDate}</td>
                    <td className="p-4">{pay.paymentDate || "—"}</td>
                    <td className="p-4 font-bold text-slate-900">${pay.amount}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                          pay.status === "Paid"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}
                      >
                        {pay.status === "Paid" ? (
                          <CheckCircle className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Clock className="h-3 w-3 text-amber-500" />
                        )}
                        {pay.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {pay.status !== "Paid" && (
                          <button
                            id={`collect-btn-${pay.id}`}
                            onClick={() => openCollectPayment(pay)}
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-indigo-500 transition-all cursor-pointer shadow-xs"
                          >
                            Collect Payment
                          </button>
                        )}
                        <button
                          id={`view-invoice-btn-${pay.id}`}
                          onClick={() => openInvoiceSheet(pay)}
                          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all cursor-pointer"
                        >
                          <Receipt className="h-3.5 w-3.5 text-slate-400" />
                          Invoice Statement
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Payment Dialog */}
      {isCollectOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <DollarSign className="h-5 w-5 text-indigo-600" />
                Collect Gym Dues
              </h3>
              <button
                onClick={() => setIsCollectOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-1.5 border border-slate-100 text-xs">
              <p className="text-slate-500 font-medium">Billed Statement:</p>
              <p className="text-sm font-bold text-slate-900">{selectedInvoice.memberName}</p>
              <div className="flex items-center justify-between font-bold text-slate-700">
                <span>Invoice Total:</span>
                <span>${selectedInvoice.amount}</span>
              </div>
              <div className="flex items-center justify-between font-bold text-indigo-600">
                <span>Outstanding Balance:</span>
                <span>${selectedInvoice.balance}</span>
              </div>
            </div>

            <form onSubmit={handleCollectPaymentSubmit} className="space-y-4 text-xs">
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Payment Method</label>
                  <select
                    value={collectMethod}
                    onChange={(e) => setCollectMethod(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-semibold text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="Credit Card">Credit/Debit Card</option>
                    <option value="Cash">Cash Handover</option>
                    <option value="Apple Pay">Apple Pay / Mobile Wallet</option>
                    <option value="Bank Transfer">Direct Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Collect Amount ($)</label>
                  <input
                    type="number"
                    max={selectedInvoice.balance}
                    required
                    placeholder="e.g. 99"
                    value={collectAmount}
                    onChange={(e) => setCollectAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-medium placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-slate-400">
                    Entering less than the outstanding balance generates a partial credit.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCollectOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 cursor-pointer"
                >
                  Collect Dues
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Details Statement sheet Overlay */}
      {isInvoiceOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">Gymfinity Official Invoice Statement</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer shadow-sm"
                >
                  <Printer className="h-4 w-4 text-slate-400" />
                  Print Receipt
                </button>
                <button
                  onClick={() => {
                    setIsInvoiceOpen(false);
                    setSelectedInvoice(null);
                  }}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Print Friendly Sheet */}
            <div className="space-y-6 print:p-0" id="print-sheet-content">
              {/* Receipt Header Grid */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-sm font-black tracking-widest text-indigo-600 uppercase">GYMFINITY</span>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                    11-C, DHA Phase V, Karachi<br />
                    Phone: (021) 111-GYMFINITY<br />
                    Email: finance@gymfinity.com
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <h4 className="text-lg font-extrabold text-slate-900 uppercase">Statement</h4>
                  <div className="text-xs text-slate-500 font-semibold space-y-0.5">
                    <p>Invoice #: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-900 font-mono">{selectedInvoice.invoiceNumber}</code></p>
                    <p>Bill Date: {selectedInvoice.billingDate}</p>
                    <p>Status: <span className={selectedInvoice.status === "Paid" ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>{selectedInvoice.status}</span></p>
                  </div>
                </div>
              </div>

              {/* Client and gym reference details */}
              <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-4 text-xs font-medium">
                <div className="space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wide">Billed To:</span>
                  <p className="font-extrabold text-slate-950">{selectedInvoice.memberName}</p>
                  <p className="text-slate-500 font-semibold">Member ID: {selectedInvoice.memberId}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wide">Payment Details:</span>
                  <p className="text-slate-600">Method: {selectedInvoice.paymentMethod || "Pending collection"}</p>
                  <p className="text-slate-600">Trans Date: {selectedInvoice.paymentDate || "—"}</p>
                </div>
              </div>

              {/* Item details table */}
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-3 font-bold text-slate-400 border-b border-slate-200 pb-2 uppercase tracking-wide">
                  <span className="col-span-2">Description</span>
                  <span className="text-right">Line Total</span>
                </div>
                
                <div className="grid grid-cols-3 font-semibold text-slate-800 py-1.5 border-b border-slate-100">
                  <div className="col-span-2 space-y-0.5">
                    <span className="font-extrabold text-slate-950">{selectedInvoice.planName} Membership Subscription</span>
                    <p className="text-[10px] text-slate-400">Recurring gym admittance and workout perks.</p>
                  </div>
                  <span className="text-right self-center font-extrabold text-slate-950">${selectedInvoice.amount}</span>
                </div>
              </div>

              {/* Total calculations */}
              <div className="flex justify-end text-xs">
                <div className="w-56 space-y-2 font-medium">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>${selectedInvoice.amount}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Tax (0%):</span>
                    <span>$0</span>
                  </div>
                  <div className="flex justify-between text-slate-950 font-black border-t border-slate-100 pt-2 text-sm">
                    <span>Total Amount:</span>
                    <span>${selectedInvoice.amount}</span>
                  </div>
                  <div className="flex justify-between text-indigo-600 font-bold">
                    <span>Balance Outstanding:</span>
                    <span>${selectedInvoice.balance}</span>
                  </div>
                </div>
              </div>

              {/* Legal footer */}
              <div className="border-t border-slate-100 pt-4 text-center text-[10px] text-slate-400 font-semibold">
                Thank you for your business. Gymfinity and barbell branding are registered trademarks. All dues are non-refundable.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
