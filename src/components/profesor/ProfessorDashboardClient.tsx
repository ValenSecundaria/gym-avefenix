"use client";

import React, { useState } from "react";
import { Activity, AlertCircle, BarChart3, CheckCircle2, Search, Users } from "lucide-react";
import type { DashboardStats, PlanOption, StaffMemberItem } from "@/types";
import { useAdminTheme, type AdminTheme } from "@/lib/use-admin-theme";
import { useAuthSession } from "@/context/auth-session-context";
import { NewMemberModal } from "@/components/admin/NewMemberModal";
import { MetricsPanel } from "@/components/admin/MetricsPanel";
import { StaffPaymentModal } from "./StaffPaymentModal";
import { TeacherShiftToggleCard } from "./TeacherShiftToggleCard";
import { StaffClientsTable } from "./StaffClientsTable";
import { TeacherLiveFeedTable } from "./TeacherLiveFeedTable";
import { ProfessorHeader } from "./ProfessorHeader";
import { useProfessorDashboard } from "./use-professor-dashboard";
import { useTeacherLiveFeed } from "./use-teacher-live-feed";
import { useCheckInKeyForwarding } from "@/hooks/use-checkin-key-forwarding";
import { dispatchScreens } from "@/lib/screens/screen-dispatcher";
import { usePhotoSync } from "@/lib/offline/use-local-photos";
import { PendingPhotosNotice } from "@/components/admin/PendingPhotosNotice";

interface Props {
  userId?: string;
  initialStats: DashboardStats;
  initialPlans: PlanOption[];
  initialTheme: AdminTheme;
  professorName: string;
}

export function ProfessorDashboardClient({ userId, initialStats, initialPlans, initialTheme, professorName }: Props) {
  const { theme, toggleTheme } = useAdminTheme(initialTheme);
  const { status: authStatus, user } = useAuthSession();
  const [activeTab, setActiveTab] = useState<"LIVE_FEED" | "CLIENTS" | "METRICS">("LIVE_FEED");
  const [isNewMemberOpen, setIsNewMemberOpen] = useState(false);
  const [newMemberFormKey, setNewMemberFormKey] = useState(0);
  const [payingMember, setPayingMember] = useState<StaffMemberItem | null>(null);

  const d = useProfessorDashboard(initialStats, initialPlans, authStatus, user);
  const feed = useTeacherLiveFeed();
  const canCreate = d.plans.length > 0;
  const checkInScreenOnline = useCheckInKeyForwarding();
  usePhotoSync();

  return (
    <div data-theme={theme} className="min-h-screen bg-fx-base text-fx-text">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <ProfessorHeader
          displayName={user?.name || professorName}
          isRefreshing={d.isRefreshing}
          onRefresh={() => { void d.refreshAll(); void feed.refreshCheckIns(); }}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenNewMember={() => { setNewMemberFormKey((k) => k + 1); setIsNewMemberOpen(true); }}
          canCreateMember={canCreate}
          checkInScreenOnline={checkInScreenOnline}
          onOpenCheckInScreen={() => void dispatchScreens()}
        />

        {(userId || user?.id) && <TeacherShiftToggleCard userId={userId || user?.id || ""} />}
        <PendingPhotosNotice />

        {!canCreate && (
          <div role="status" className="flex items-center gap-2.5 p-4 rounded-2xl bg-fx-amber/15 border border-fx-amber/50 text-sm font-bold text-fx-amber">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>No hay planes a la venta: la administración debe cargar uno primero.</span>
          </div>
        )}

        {d.toast && (
          <div role="status" className="flex items-center gap-2.5 p-4 rounded-2xl bg-fx-green/15 border border-fx-green text-sm font-bold text-fx-green">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{d.toast}</span>
          </div>
        )}

        <div className="flex flex-col rounded-2xl bg-fx-surface border border-fx-border shadow-lg p-4 sm:p-6 gap-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-fx-border">
            <div className="flex flex-wrap gap-2" role="tablist">
              {[
                { tab: "LIVE_FEED", label: "Ingresos de Hoy", icon: Activity },
                { tab: "CLIENTS", label: "Clientes", icon: Users },
                { tab: "METRICS", label: "Métricas", icon: BarChart3 },
              ].map(({ tab, label, icon: Icon }) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`min-h-[48px] px-4 sm:px-5 rounded-xl inline-flex items-center gap-2 text-sm sm:text-base font-bold transition-colors cursor-pointer ${
                    activeTab === tab ? "bg-fx-orange text-white" : "text-fx-muted hover:text-fx-text hover:bg-fx-hover"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                  {tab === "LIVE_FEED" && feed.checkIns.length > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab ? "bg-white/20 text-white" : "bg-fx-base text-fx-muted"}`}>
                      {feed.checkIns.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {activeTab === "CLIENTS" && (
              <div className="relative w-full lg:w-80">
                <Search className="w-5 h-5 text-fx-muted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={d.searchInput}
                  onChange={(e) => d.setSearchInput(e.target.value)}
                  placeholder="Buscar por nombre o DNI..."
                  className="w-full min-h-[52px] pl-12 pr-4 rounded-xl bg-fx-base border-2 border-fx-border focus:border-fx-orange focus:outline-none text-base text-fx-text"
                />
              </div>
            )}
          </div>

          {activeTab === "LIVE_FEED" ? (
            <TeacherLiveFeedTable
              items={feed.checkIns}
              isLoading={feed.isLoadingCheckIns}
            />
          ) : activeTab === "CLIENTS" ? (
            <StaffClientsTable
              data={d.data}
              statusFilter={d.statusFilter}
              onChangeFilter={(f) => { d.setStatusFilter(f); d.setPage(1); d.setIsLoading(true); }}
              isLoading={d.isLoading}
              listError={d.listError}
              onGoToPage={(p) => { d.setPage(p); d.setIsLoading(true); }}
              onPayMember={setPayingMember}
              canCreateMember={canCreate}
              onSuccessSync={(msg: string) => { d.setToast(msg); void feed.refreshCheckIns(); void d.refreshAll(); }}
            />
          ) : (
            <div className="hidden lg:block">
              <MetricsPanel stats={d.stats} hideMoney onGoToTab={(t) => { setActiveTab("CLIENTS"); d.setStatusFilter(t === "DEBTORS" ? "VENCIDA" : "ALL"); }} />
            </div>
          )}
        </div>
      </div>

      <NewMemberModal
        key={newMemberFormKey}
        isOpen={isNewMemberOpen && canCreate}
        onClose={() => setIsNewMemberOpen(false)}
        plans={d.plans}
        onSubmitMember={d.handleCreateMember}
        hidePrices
      />
      <StaffPaymentModal
        key={payingMember?.id ?? "none"}
        member={payingMember}
        plans={d.plans}
        registeredByName={user?.name || professorName}
        onClose={() => setPayingMember(null)}
        onConfirm={d.handleConfirmPayment}
      />
    </div>
  );
}
