"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle2, Menu, Search } from "lucide-react";
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
import { MetricsPanel } from "./MetricsPanel";
import { ADMIN_SECTIONS, AdminSidebar } from "./AdminSidebar";
import { NewMemberModal, type NewMemberFormValues } from "./NewMemberModal";
import { PaymentModal } from "./PaymentModal";
import { createMember } from "@/actions/members.actions";
import { registerPayment } from "@/actions/payments.actions";
import { getDashboardOverview } from "@/actions/dashboard.actions";
import { getTodayCheckIns } from "@/actions/checkin.actions";
import { useAdminTheme, type AdminTheme } from "@/lib/use-admin-theme";
import { gymBroadcast } from "@/lib/screens/broadcast-channel";
import { useAuthSession } from "@/context/auth-session-context";

export type AdminTab = "LIVE_FEED" | "DEBTORS" | "ABSENT" | "METRICS";

interface AdminDashboardClientProps {
  initialStats: DashboardStats;
  initialCheckIns: LiveCheckInItem[];
  initialDebtors: DebtorMemberItem[];
  initialAbsent: AbsentMemberItem[];
  plans: PlanOption[];
  initialTheme: AdminTheme;
}

export function AdminDashboardClient({
  initialStats,
  initialCheckIns,
  initialDebtors,
  initialAbsent,
  plans,
  initialTheme,
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
  const { theme, toggleTheme } = useAdminTheme(initialTheme);
  const { status: authStatus } = useAuthSession();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  useEffect(() => {
    if (authStatus === "UNAUTHENTICATED") {
      window.location.href = "/login";
    }
  }, [authStatus]);

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
    const unsubscribe = gymBroadcast.subscribe((msg) => {
      if (msg.type === "CHECKIN_EVENT" || msg.type === "REFRESH_DASHBOARD") {
        refreshAllData();
      }
    });
    return () => {
      window.clearInterval(interval);
      unsubscribe();
    };
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
  const section = ADMIN_SECTIONS.find((s) => s.tab === activeTab) || ADMIN_SECTIONS[0];
  const SectionIcon = section.icon;

  return (
    <div data-theme={theme} className="min-h-screen bg-fx-base text-fx-text flex">
      <AdminSidebar
        activeTab={activeTab}
        onSelect={setActiveTab}
        counts={{ LIVE_FEED: checkIns.length, DEBTORS: debtors.length, ABSENT: absentMembers.length }}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={closeMobileMenu}
      />

      <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <HeaderStats stats={stats} onOpenNewMember={() => setIsNewMemberOpen(true)} onRefresh={refreshAllData} isRefreshing={isRefreshing} theme={theme} onToggleTheme={toggleTheme} />

        {feedbackBanner && (
          <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-fx-green/15 border border-fx-green text-sm font-bold text-fx-green">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{feedbackBanner}</span>
          </div>
        )}

        <div className="flex flex-col rounded-2xl bg-fx-surface border border-fx-border shadow-lg p-5 sm:p-6 gap-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-fx-border">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Abrir menú"
                className="lg:hidden w-11 h-11 rounded-xl bg-fx-base border border-fx-border flex items-center justify-center text-fx-text cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
              <SectionIcon className="w-5 h-5 text-fx-orange" />
              <h2 className="text-lg font-extrabold text-fx-text">{section.label}</h2>
            </div>

            <div className={`relative w-full lg:w-72 ${activeTab === "METRICS" ? "hidden" : ""}`}>
              <Search className="w-4 h-4 text-fx-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar por DNI o apellido..." className="w-full min-h-[48px] pl-10 pr-4 rounded-xl bg-fx-base border border-fx-border focus:border-fx-orange focus:outline-none text-sm text-fx-text" />
            </div>
          </div>

          {activeTab === "LIVE_FEED" && <LiveFeedTable items={checkIns.filter((c) => match(c.fullName, c.dni))} />}
          {activeTab === "DEBTORS" && <DebtorsTable debtors={debtors.filter((d) => match(d.fullName, d.dni))} onRegisterPayment={setSelectedDebtor} />}
          {activeTab === "ABSENT" && <AbsentMembersTable absentMembers={absentMembers.filter((a) => match(a.fullName, a.dni))} />}
          {activeTab === "METRICS" && <MetricsPanel stats={stats} onGoToTab={setActiveTab} />}
        </div>
      </div>
      </div>

      <NewMemberModal isOpen={isNewMemberOpen} onClose={() => setIsNewMemberOpen(false)} plans={plans} onSubmitMember={handleCreateMember} />
      <PaymentModal debtor={selectedDebtor} plans={plans} onClose={() => setSelectedDebtor(null)} onConfirmPayment={handleConfirmPayment} />
    </div>
  );
}
