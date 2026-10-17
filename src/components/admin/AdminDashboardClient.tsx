"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Activity, AlertOctagon, UserMinus, CheckCircle2, Search } from "lucide-react";
import type {
  AbsentMemberItem,
  DashboardStats,
  DebtorMemberItem,
  LiveCheckInItem,
  PaymentMethodType,
  PlanOption,
} from "@/types";
import { HeaderStats } from "./HeaderStats";
import { LiveFeedTable } from "./LiveFeedTable";
import { DebtorsTable } from "./DebtorsTable";
import { AbsentMembersTable } from "./AbsentMembersTable";
import { NewMemberModal, type NewMemberFormValues } from "./NewMemberModal";
import { PaymentModal } from "./PaymentModal";
import { createMember } from "@/actions/members.actions";
import { registerPayment } from "@/actions/payments.actions";
import { getDashboardOverview } from "@/actions/dashboard.actions";
import { getTodayCheckIns } from "@/actions/checkin.actions";

type AdminTab = "LIVE_FEED" | "DEBTORS" | "ABSENT";

interface AdminDashboardClientProps {
  initialStats: DashboardStats;
  initialCheckIns: LiveCheckInItem[];
  initialDebtors: DebtorMemberItem[];
  initialAbsent: AbsentMemberItem[];
  plans: PlanOption[];
}

export function AdminDashboardClient({
  initialStats,
  initialCheckIns,
  initialDebtors,
  initialAbsent,
  plans,
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("LIVE_FEED");
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [checkIns, setCheckIns] = useState<LiveCheckInItem[]>(initialCheckIns);
  const [debtors, setDebtors] = useState<DebtorMemberItem[]>(initialDebtors);
  const [absentMembers, setAbsentMembers] = useState<AbsentMemberItem[]>(initialAbsent);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isNewMemberOpen, setIsNewMemberOpen] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState<DebtorMemberItem | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  const refreshAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [overviewRes, checkInsRes] = await Promise.all([getDashboardOverview(), getTodayCheckIns()]);
      if (overviewRes.success && overviewRes.data) {
        setStats(overviewRes.data.stats);
        setDebtors(overviewRes.data.debtors);
        setAbsentMembers(overviewRes.data.absentMembers);
      }
      if (checkInsRes.success && checkInsRes.data) setCheckIns(checkInsRes.data);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const interval = window.setInterval(refreshAllData, 15000);
    return () => window.clearInterval(interval);
  }, [refreshAllData]);

  const showToast = (msg: string) => {
    setFeedbackBanner(msg);
    window.setTimeout(() => setFeedbackBanner(null), 5000);
  };

  const handleCreateMember = async (v: NewMemberFormValues) => {
    const res = await createMember({ ...v, photoBase64: v.photoBase64 || undefined });
    if (res.success) {
      showToast(`Socio ${v.fullName} registrado y habilitado con éxito.`);
      await refreshAllData();
    }
    return { success: res.success, error: res.error };
  };

  const handleConfirmPayment = async (payload: {
    memberId: string;
    planId: string;
    amount: number;
    method: PaymentMethodType;
    notes?: string;
  }) => {
    const res = await registerPayment(payload);
    if (res.success && res.data) {
      showToast(`Pago registrado (${res.data.planName}). Membresía renovada.`);
      await refreshAllData();
    }
    return { success: res.success, error: res.error };
  };

  const q = searchQuery.trim().toLowerCase();
  const match = (name: string, dni: string) => !q || name.toLowerCase().includes(q) || dni.includes(q);
  const tabCls = (t: AdminTab) =>
    `min-h-[52px] px-5 rounded-xl text-sm font-bold inline-flex items-center gap-2.5 transition-all cursor-pointer ${
      activeTab === t ? "bg-[#F95716] text-white shadow-[0_0_16px_rgba(249,87,22,0.35)]" : "bg-[#0B0B0C] border border-[#2C2D35] text-[#8A909A] hover:text-[#F4F5F7]"
    }`;

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F4F5F7] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <HeaderStats stats={stats} onOpenNewMember={() => setIsNewMemberOpen(true)} onRefresh={refreshAllData} isRefreshing={isRefreshing} />

        {feedbackBanner && (
          <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-[#10B981]/15 border border-[#10B981] text-sm font-bold text-[#10B981]">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{feedbackBanner}</span>
          </div>
        )}

        <div className="flex flex-col rounded-2xl bg-[#17171C] border border-[#2C2D35] shadow-lg p-5 sm:p-6 gap-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#2C2D35]">
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => setActiveTab("LIVE_FEED")} className={tabCls("LIVE_FEED")}>
                <Activity className="w-4 h-4" />
                <span>Ingresos de Hoy (En Vivo)</span>
                <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-black/40 text-white">{checkIns.length}</span>
              </button>
              <button type="button" onClick={() => setActiveTab("DEBTORS")} className={tabCls("DEBTORS")}>
                <AlertOctagon className="w-4 h-4" />
                <span>Cuotas Pendientes y Deudores</span>
                <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-[#D92614]/20 border border-[#D92614]/40 text-[#D92614]">{debtors.length}</span>
              </button>
              <button type="button" onClick={() => setActiveTab("ABSENT")} className={tabCls("ABSENT")}>
                <UserMinus className="w-4 h-4" />
                <span>Socios Ausentes / Recuperación</span>
                <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-[#FFB300]/20 border border-[#FFB300]/40 text-[#FFB300]">{absentMembers.length}</span>
              </button>
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-[#8A909A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar por DNI o apellido..." className="w-full min-h-[48px] pl-10 pr-4 rounded-xl bg-[#0B0B0C] border border-[#2C2D35] focus:border-[#F95716] focus:outline-none text-sm text-[#F4F5F7]" />
            </div>
          </div>

          {activeTab === "LIVE_FEED" && <LiveFeedTable items={checkIns.filter((c) => match(c.fullName, c.dni))} />}
          {activeTab === "DEBTORS" && <DebtorsTable debtors={debtors.filter((d) => match(d.fullName, d.dni))} onRegisterPayment={setSelectedDebtor} />}
          {activeTab === "ABSENT" && <AbsentMembersTable absentMembers={absentMembers.filter((a) => match(a.fullName, a.dni))} />}
        </div>
      </div>

      <NewMemberModal isOpen={isNewMemberOpen} onClose={() => setIsNewMemberOpen(false)} plans={plans} onSubmitMember={handleCreateMember} />
      <PaymentModal debtor={selectedDebtor} plans={plans} onClose={() => setSelectedDebtor(null)} onConfirmPayment={handleConfirmPayment} />
    </div>
  );
}
