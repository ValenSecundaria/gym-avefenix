"use client";

import React, { useState } from "react";
import { Activity, AlertCircle, BarChart3, CheckCircle2, Search, Users } from "lucide-react";
import type { DashboardStats, PlanOption, StaffMemberItem } from "@/types";
import { useAdminTheme, type AdminTheme } from "@/lib/use-admin-theme";
import { useAuthSession } from "@/context/auth-session-context";
import { NewMemberModal } from "@/components/admin/NewMemberModal";
import { MetricsPanel } from "@/components/admin/MetricsPanel";
import { PendingPhotosNotice } from "@/components/admin/PendingPhotosNotice";
import { StaffPaymentModal } from "./StaffPaymentModal";
import { TeacherShiftToggleCard } from "./TeacherShiftToggleCard";
import { ProfessorSalaStats } from "./ProfessorSalaStats";
import { StaffClientsTable } from "./StaffClientsTable";
import { TeacherLiveFeedTable } from "./TeacherLiveFeedTable";
import { ProfessorHeader } from "./ProfessorHeader";
import { useProfessorDashboard } from "./use-professor-dashboard";
import { useTeacherLiveFeed } from "./use-teacher-live-feed";
import { useCheckInKeyForwarding } from "@/hooks/use-checkin-key-forwarding";
import { dispatchScreens } from "@/lib/screens/screen-dispatcher";
import { usePhotoSync } from "@/lib/offline/use-local-photos";

interface Props {
  userId?: string;
  initialStats: DashboardStats;
  initialPlans: PlanOption[];
  initialTheme: AdminTheme;
  professorName: string;
}

export function ProfessorDashboardClient({
  userId,
  initialStats,
  initialPlans,
  initialTheme,
  professorName,
}: Props) {
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

  const handleSyncFeedback = (msg: string) => {
    d.setToast(msg);
    void feed.refreshCheckIns();
    void d.refreshAll();
  };

  return (
    <div data-theme={theme} className="min-h-screen bg-fx-base text-fx-text">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-7 space-y-5">
        <ProfessorHeader
          displayName={user?.name || professorName}
          isRefreshing={d.isRefreshing}
          onRefresh={() => {
            void d.refreshAll();
            void feed.refreshCheckIns();
          }}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenNewMember={() => {
            setNewMemberFormKey((k) => k + 1);
            setIsNewMemberOpen(true);
          }}
          canCreateMember={canCreate}
          checkInScreenOnline={checkInScreenOnline}
          onOpenCheckInScreen={() => void dispatchScreens()}
        />

        {!canCreate && (
          <div role="status" className="flex items-center gap-2.5 p-4 rounded-lg bg-fx-amber/15 border border-fx-amber/50 text-[15px] font-bold text-fx-amber">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>No hay planes a la venta: la administración debe cargar uno primero.</span>
          </div>
        )}

        {d.toast && (
          <div role="status" className="flex items-center gap-2.5 p-4 rounded-lg bg-fx-green/15 border border-fx-green text-[15px] font-bold text-fx-green">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{d.toast}</span>
          </div>
        )}

        {/* Disposición dividida 4 / 8: Columna izquierda de fichaje y sala + Columna derecha de operación */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <aside className="lg:col-span-4 lg:sticky lg:top-6 space-y-4">
            {(userId || user?.id) && <TeacherShiftToggleCard userId={userId || user?.id || ""} />}
            <ProfessorSalaStats
              todayCount={feed.checkIns.length}
              activeMembers={d.stats.activeMembers}
              debtorsCount={d.stats.debtorsCount}
              onSelectToday={() => setActiveTab("LIVE_FEED")}
              onSelectActive={() => {
                setActiveTab("CLIENTS");
                d.setStatusFilter("AL_DIA");
                d.setPage(1);
              }}
              onSelectExpired={() => {
                setActiveTab("CLIENTS");
                d.setStatusFilter("VENCIDA");
                d.setPage(1);
              }}
            />
            <PendingPhotosNotice />
          </aside>

          <section className="lg:col-span-8 flex flex-col rounded-lg bg-fx-surface border-2 border-fx-border shadow-lg p-5 sm:p-6 gap-5">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-fx-border">
              <div className="flex flex-wrap gap-2" role="tablist">
                {[
                  { tab: "LIVE_FEED", label: "Ingresos de Hoy", icon: Activity, desktopOnly: false },
                  { tab: "CLIENTS", label: "Socios", icon: Users, desktopOnly: false },
                  { tab: "METRICS", label: "Métricas de Sala", icon: BarChart3, desktopOnly: true },
                ].map(({ tab, label, icon: Icon, desktopOnly }) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab}
                    onClick={() => setActiveTab(tab as typeof activeTab)}
                    className={`${desktopOnly ? "hidden lg:inline-flex" : "inline-flex"} min-h-[48px] px-4 rounded-md items-center gap-2 text-sm font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
                      activeTab === tab
                        ? "bg-fx-orange text-[#0A0B0D]"
                        : "bg-fx-base border border-fx-border text-fx-muted hover:text-fx-text"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                    {tab === "LIVE_FEED" && feed.checkIns.length > 0 && (
                      <span className={`font-mono text-xs px-2 py-0.5 rounded-sm ${activeTab === tab ? "bg-[#0A0B0D] text-[#EAB308]" : "bg-fx-surface text-fx-muted"}`}>
                        {feed.checkIns.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {activeTab === "CLIENTS" && (
                <div className="relative w-full xl:w-72">
                  <Search className="w-5 h-5 text-fx-muted absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={d.searchInput}
                    onChange={(e) => d.setSearchInput(e.target.value)}
                    placeholder="Buscar por nombre o DNI..."
                    className="w-full min-h-[48px] pl-12 pr-4 rounded-md bg-fx-base border border-fx-border focus:border-fx-orange focus:outline-none text-base text-fx-text"
                  />
                </div>
              )}
            </div>

            {activeTab === "LIVE_FEED" ? (
              <TeacherLiveFeedTable items={feed.checkIns} isLoading={feed.isLoadingCheckIns} onSuccessSync={handleSyncFeedback} />
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
                onSuccessSync={handleSyncFeedback}
              />
            ) : (
              <div className="hidden lg:block">
                <MetricsPanel stats={d.stats} hideMoney onGoToTab={(t) => { setActiveTab("CLIENTS"); d.setStatusFilter(t === "DEBTORS" ? "VENCIDA" : "ALL"); }} />
              </div>
            )}
          </section>
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
