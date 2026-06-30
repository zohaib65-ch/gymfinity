"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Search,
  Plus,
  QrCode,
  Mail,
  Phone,
  Calendar,
  Layers,
  Check,
  UserX,
  UserCheck,
  Trash2,
  ChevronRight,
  Sparkles,
  Info,
  ArrowRight,
  Printer,
  X,
} from "lucide-react";
import { getMembers, saveMembers, Member, getPlans, Plan, getPayments, savePayments, Payment } from "@/lib/db";

export default function MembersView() {
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive" | "Expired">("All");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Modal / Form states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteConfirmMember, setDeleteConfirmMember] = useState<Member | null>(null);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [newMemberPlanId, setNewMemberPlanId] = useState("");

  useEffect(() => {
    getMembers().then(setMembers);
    getPlans().then(setPlans);
  }, []);

  // Set default selected member
  useEffect(() => {
    if (members.length > 0 && !selectedMember) {
      setSelectedMember(members[0]);
    }
  }, [members, selectedMember]);

  // Handle Search and Filters
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm) ||
      (m.id && m.id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "All" || m.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle Add Member Form Submit
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberEmail || !newMemberPhone || !newMemberPlanId) return;

    const selectedPlan = plans.find((p) => p.id === newMemberPlanId);
    if (!selectedPlan) return;

    const newId = `mem-${Date.now()}`;
    const generatedQR = `GYMF-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newMember: Member = {
      id: newId,
      name: newMemberName,
      email: newMemberEmail,
      phone: newMemberPhone,
      joinsDate: new Date().toISOString().split("T")[0],
      status: "Active",
      currentPlanId: selectedPlan.id,
      currentPlanName: selectedPlan.name,
      avatarUrl: `https://picsum.photos/seed/${newId}/120/120`,
      qrCode: generatedQR,
    };

    // Save member
    const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);
    saveMembers(updatedMembers);

    // Auto-create initial invoice for the selected plan
    const currentPayments = await getPayments();
    const newInvoice: Payment = {
      id: `pay-${Date.now()}`,
      memberId: newId,
      memberName: newMemberName,
      amount: selectedPlan.price,
      billingDate: new Date().toISOString().split("T")[0],
      status: "Pending", // Invoice starts as pending payment
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      balance: selectedPlan.price,
      planName: selectedPlan.name,
    };
    const updatedPayments = [newInvoice, ...currentPayments];
    savePayments(updatedPayments as any);

    // Reset Form
    setNewMemberName("");
    setNewMemberEmail("");
    setNewMemberPhone("");
    setNewMemberPlanId("");
    setIsAddOpen(false);

    // Select the new member
    setSelectedMember(newMember);
  };

  // Change Member Status (Suspend / Activate)
  const handleChangeStatus = (memberId: string, nextStatus: "Active" | "Inactive" | "Expired") => {
    const updated = members.map((m) => {
      if (m.id === memberId) {
        const next = { ...m, status: nextStatus };
        if (selectedMember && selectedMember.id === memberId) {
          setSelectedMember(next);
        }
        return next;
      }
      return m;
    });
    setMembers(updated);
    saveMembers(updated);
  };

  // Delete Member
  const handleDeleteMember = (member: Member) => {
    setDeleteConfirmMember(member);
  };

  const confirmDeleteMember = () => {
    if (!deleteConfirmMember) return;
    const updated = members.filter((m) => m.id !== deleteConfirmMember.id);
    setMembers(updated);
    saveMembers(updated);
    setSelectedMember(updated[0] || null);
    setDeleteConfirmMember(null);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="members-view-root">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Gym Members Directory
          </h1>
          <p className="text-slate-500 text-sm">
            Enroll, view stats, manage renewals, and distribute entry QR keys.
          </p>
        </div>
        <button
          id="add-member-btn"
          onClick={() => {
            if (plans.length > 0) {
              setNewMemberPlanId(plans[0].id);
            }
            setIsAddOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 hover:shadow-indigo-500/20 hover:shadow-lg transition-all cursor-pointer w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Enroll New Member
        </button>
      </div>

      {/* Grid of Search List & Detail View */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Side: Directory List & Search */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 h-5 w-5 my-auto" />
              <input
                id="member-search"
                type="text"
                placeholder="Search by Name or Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Status Filter Tab Group */}
            <div className="flex rounded-lg bg-slate-100 p-1 text-slate-600 border border-slate-100">
              {(["All", "Active", "Inactive", "Expired"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`flex-1 rounded-md py-1 text-[10px] font-bold transition-all cursor-pointer text-center ${
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

          {/* Members List Scrollbox */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden h-[450px] flex flex-col">
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-slate-400">
                  <UserX className="h-10 w-10 stroke-1 mb-2" />
                  <p className="text-xs font-semibold">No registered members found.</p>
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className={`flex items-center justify-between p-4 cursor-pointer transition-all ${
                      selectedMember?.id === member.id
                        ? "bg-indigo-50/50 border-l-4 border-indigo-600 pl-3"
                        : "hover:bg-slate-50 border-l-4 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                        {member.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Users className="h-5 w-5 text-slate-400 m-auto mt-2.5" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-900">{member.name}</p>
                        <p className="text-[10px] font-medium text-slate-500">{member.currentPlanName} Plan</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Badge */}
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                          member.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : member.status === "Expired"
                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {member.status}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Detailed View Sheet */}
        <div className="lg:col-span-2">
          {selectedMember ? (
            <motion.div
              layoutId="member-details-card"
              className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-full min-h-[550px]"
              id="member-details-card-container"
            >
              {/* Header Profile Section */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="h-16 w-16 overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
                    {selectedMember.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedMember.avatarUrl}
                        alt={selectedMember.name}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Users className="h-8 w-8 text-slate-400 m-auto mt-4" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-2">
                      {selectedMember.name}
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          selectedMember.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : selectedMember.status === "Expired"
                            ? "bg-red-50 text-red-700 border border-red-100"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {selectedMember.status}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">Joined {selectedMember.joinsDate}</p>
                  </div>
                </div>

                {/* Status Toggle buttons */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {selectedMember.status !== "Active" ? (
                    <button
                      onClick={() => handleChangeStatus(selectedMember.id, "Active")}
                      className="flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      Activate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleChangeStatus(selectedMember.id, "Inactive")}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <UserX className="h-3.5 w-3.5" />
                      Suspend
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteMember(selectedMember)}
                    className="rounded-lg border border-red-100 bg-red-50/50 p-2 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete member profile"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Grid content */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                {/* Profile contact Details & Subscription */}
                <div className="space-y-6">
                  {/* Contact detail card */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Contact Information</h3>
                    <div className="space-y-2.5 text-xs text-slate-700 font-medium">
                      <div className="flex items-center gap-2.5">
                        <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="truncate">{selectedMember.email}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>{selectedMember.phone}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>Member ID: <code className="bg-slate-200/50 px-1.5 py-0.5 rounded text-[10px]">{selectedMember.id}</code></span>
                      </div>
                    </div>
                  </div>

                  {/* Subscription card */}
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-500">Subscription Status</h3>
                      <Sparkles className="h-4 w-4 text-indigo-500" />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm font-extrabold text-slate-900">{selectedMember.currentPlanName} Membership</p>
                      <p className="text-xs text-slate-500 font-medium">
                        Access tier configured via plans management portal.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-indigo-100/30 flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>Status:</span>
                      <span className={selectedMember.status === "Active" ? "text-emerald-600" : "text-amber-600"}>
                        {selectedMember.status === "Active" ? "Paid & Verified" : "Expired / Suspended"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gate Entry Pass / printable QR Card */}
                <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl p-6 bg-slate-50/20 shadow-xs text-center">
                  <div className="space-y-4">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                      <QrCode className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-900">Print Gate Entry Pass</p>
                      <p className="text-[10px] text-slate-400 max-w-[200px] leading-relaxed mx-auto">
                        This pass contains the gate RFID key for instant entry authentication.
                      </p>
                    </div>

                    {/* Virtual Gate Key Badge */}
                    <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm inline-block space-y-3 max-w-[220px]">
                      {/* Pass Gymfinity Logo */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-[10px] font-black text-indigo-600 tracking-wider">GYMFINITY</span>
                        <span className="text-[8px] font-bold text-slate-400">GATE PASS</span>
                      </div>
                      
                      {/* Mock barcode grid */}
                      <div className="flex flex-col items-center py-2 space-y-1">
                        <div className="bg-slate-900 h-14 w-28 flex items-center justify-center text-white rounded">
                          <QrCode className="h-10 w-10" />
                        </div>
                        <span className="text-[9px] font-mono tracking-wider text-slate-500 mt-1">
                          {selectedMember.qrCode || "GYMF-TEMP-KEY"}
                        </span>
                      </div>

                      {/* Pass footer */}
                      <div className="text-[9px] font-semibold text-slate-700 truncate border-t border-slate-100 pt-2">
                        {selectedMember.name}
                      </div>
                    </div>

                    <div>
                      <button
                        onClick={() => window.print()}
                        className="flex items-center justify-center gap-1.5 mx-auto rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                      >
                        <Printer className="h-3 w-3" />
                        Print Access Pass
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400 shadow-sm flex flex-col items-center justify-center min-h-[500px]">
              <Info className="h-12 w-12 stroke-1 mb-4 text-slate-300" />
              <p className="text-sm font-semibold">Select a member to view details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Enroll Member modal/dialog overlay */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Enroll New Gym Member</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chaudhry Zohaib"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-medium placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. name@domain.com"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-medium placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. (206) 555-0199"
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-medium placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Choose Subscription Plan</label>
                  <select
                    value={newMemberPlanId}
                    onChange={(e) => setNewMemberPlanId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-semibold text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none cursor-pointer"
                  >
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} Plan (${plan.price}/mo)
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Choosing a plan automatically generates an invoice invoice.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 cursor-pointer"
                >
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Delete Member</h3>
              <button
                onClick={() => setDeleteConfirmMember(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-100 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-900">{deleteConfirmMember.name}</p>
                  <p className="text-xs text-slate-500">{deleteConfirmMember.email}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                Are you sure you want to delete this member? All attendance and records will be permanently removed.
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeleteConfirmMember(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteMember}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 cursor-pointer"
              >
                Delete Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
