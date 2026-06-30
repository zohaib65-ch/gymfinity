"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, DollarSign, Edit3, Plus, CheckCircle, Info, X, Trash2 } from "lucide-react";
import { getPlans, savePlans, Plan } from "@/lib/db";

export default function PlansView() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Form states
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [planCycle, setPlanCycle] = useState("Monthly");
  const [planFeatures, setPlanFeatures] = useState<string[]>([]);
  const [newFeatureText, setNewFeatureText] = useState("");

  useEffect(() => {
    getPlans().then(setPlans);
  }, []);

  // Open Edit Dialog
  const handleOpenEdit = (plan: Plan) => {
    setSelectedPlan(plan);
    setPlanName(plan.name);
    setPlanPrice(plan.price.toString());
    setPlanCycle(plan.billingCycle);
    setPlanFeatures([...plan.features]);
    setIsEditing(true);
  };

  // Open Add Dialog
  const handleOpenAdd = () => {
    setSelectedPlan(null);
    setPlanName("");
    setPlanPrice("");
    setPlanCycle("Monthly");
    setPlanFeatures([]);
    setIsEditing(true);
  };

  // Add a feature to list
  const handleAddFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFeatureText.trim() && !planFeatures.includes(newFeatureText.trim())) {
      setPlanFeatures([...planFeatures, newFeatureText.trim()]);
      setNewFeatureText("");
    }
  };

  // Remove feature from list
  const handleRemoveFeature = (index: number) => {
    setPlanFeatures(planFeatures.filter((_, idx) => idx !== index));
  };

  // Save Plan Details
  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName || !planPrice || planFeatures.length === 0) return;

    let updatedPlans: Plan[] = [];

    if (selectedPlan) {
      // Edit mode
      updatedPlans = plans.map((p) => {
        if (p.id === selectedPlan.id) {
          return {
            ...p,
            name: planName,
            price: parseFloat(planPrice),
            billingCycle: planCycle,
            features: planFeatures,
          };
        }
        return p;
      });
    } else {
      // Add mode
      const newPlan: Plan = {
        id: `plan-${Date.now()}`,
        name: planName,
        price: parseFloat(planPrice),
        billingCycle: planCycle,
        features: planFeatures,
      };
      updatedPlans = [...plans, newPlan];
    }

    setPlans(updatedPlans);
    savePlans(updatedPlans);
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="plans-view-root">
      {/* Header Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Membership Subscription Tiers
          </h1>
          <p className="text-slate-500 text-sm">
            Configure gym package rates, billing terms, and perk allowances.
          </p>
        </div>
        <button
          id="add-plan-btn"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition-all cursor-pointer w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Membership Package
        </button>
      </div>

      {/* Plans Card Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan, i) => {
          // Highlight Diamond plan
          const isDiamond = plan.name.toLowerCase().includes("diamond") || plan.price > 120;
          return (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-2xl border p-6 bg-white shadow-sm h-full ${
                isDiamond ? "border-indigo-500 ring-1 ring-indigo-500" : "border-slate-200"
              }`}
              id={`plan-card-${plan.id}`}
            >
              {isDiamond && (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-extrabold text-white uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" />
                  Most Popular
                </span>
              )}

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-extrabold tracking-tight text-slate-900">{plan.name} Package</h3>
                  <button
                    onClick={() => handleOpenEdit(plan)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                    title="Edit Plan"
                    id={`edit-plan-btn-${plan.id}`}
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-baseline text-slate-900">
                  <span className="text-3xl font-extrabold tracking-tight">$</span>
                  <span className="text-5xl font-black tracking-tight">{plan.price}</span>
                  <span className="ml-1 text-xs font-semibold text-slate-400">/{plan.billingCycle.toLowerCase()}</span>
                </div>

                {/* Features List */}
                <ul className="space-y-3 pt-4 border-t border-slate-100">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs font-medium text-slate-600">
                      <CheckCircle className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-6">
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-[10px] text-slate-500 border border-slate-100">
                  <Info className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>Configured rate plans propagate automatically to registration systems.</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Edit / Add Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {selectedPlan ? `Modify ${selectedPlan.name} Package` : "Add New Membership Package"}
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Package Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Platinum VIP"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-medium placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Package Cost ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 119"
                    value={planPrice}
                    onChange={(e) => setPlanPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-medium placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1.5">Billing Terms</label>
                  <select
                    value={planCycle}
                    onChange={(e) => setPlanCycle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-semibold text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="Monthly">Monthly Recurring</option>
                    <option value="Weekly">Weekly Recurring</option>
                    <option value="Quarterly">Quarterly Pre-pay</option>
                    <option value="Annual">Annual Pre-pay</option>
                  </select>
                </div>
              </div>

              {/* Perks / Features management */}
              <div className="space-y-2 text-xs">
                <label className="block font-bold text-slate-700">Perks & Features</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add package highlight (e.g. Full Towel Service)..."
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFeature(e);
                      }
                    }}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-medium placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* Features Pill list */}
                <div className="flex flex-wrap gap-1.5 pt-2 max-h-24 overflow-y-auto">
                  {planFeatures.map((feat, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 pl-2.5 pr-1.5 py-1 text-[10px] font-semibold text-slate-700"
                    >
                      <span>{feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="rounded-md p-0.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {planFeatures.length === 0 && (
                    <span className="text-[10px] text-slate-400 font-medium">Add at least 1 feature perk before saving.</span>
                  )}
                </div>
              </div>

              {/* Footer action buttons */}
              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={planFeatures.length === 0}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
                >
                  Save Package Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
