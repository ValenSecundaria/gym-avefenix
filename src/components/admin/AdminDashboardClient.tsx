"use client";

import React, { useState, useCallback } from "react";
import { CheckCircle2, Search } from "lucide-react";
import type { AbsentMemberItem, DashboardStats, DebtorMemberItem, LiveCheckInItem, PlanOption } from "@/types";
import { HeaderStats } from "./HeaderStats";
import { AdminKpiRail } from "./AdminKpiRail";
import { AdminActiveModule } from "./AdminActiveModule";
import { ADMIN_SECTIONS, AdminSidebar } from "./AdminSidebar";
import { NewMemberModal } from "./NewMemberModal";
import { PaymentModal } from "./PaymentModal";
import { PendingMembersBanner } from "./PendingMembersBanner";
import { MemberEditModal } from "./MemberEditModal";
import { PendingPhotosNotice } from "./PendingPhotosNotice";
import { useAdminTheme, type AdminTheme } from "@/lib/use-admin-theme";
import { dispatchScreens } from "@/lib/screens/screen-dispatcher";
import { matchesSearch } from "@/lib/text";
import { useAdminDashboard } from "./use-admin-dashboard";

export type AdminTab = "LIVE_FEED" | "DEBTORS" | "PAYMENTS" | "ABSENT" | "MEMBERS" | "PLANS" | "TEACHER_ATTENDANCE" | "METRICS" | "SETTINGS";

const TABS_WITHOUT_GLOBAL_SEARCH: AdminTab[] = ["METRICS", "PAYMENTS", "PLANS", "SETTINGS", "TEACHER_ATTENDANCE"];

interface AdminDashboardClientProps {
  initialStats: DashboardStats;
  initialCheckIns: LiveCheckInItem[];
  initialDebtors: DebtorMemberItem[];
  initialAbsent: AbsentMemberItem[];
  plans: PlanOption[];
  initialTheme: AdminTheme;
}

export function AdminDashboardClient(props: AdminDashboardClientProps) {
  const { initialStats, initialCheckIns, initialDebtors, initialAbsent, plans: initialPlans, initialTheme } = props;
  const [activeTab, setActiveTab] = useState<AdminTab>("LIVE_FEED");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewMemberOpen, setIsNewMemberOpen] = useState(false);
  const [newMemberFormKey, setNewMemberFormKey] = useState(0);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useAdminTheme(initialTheme);

  const d = useAdminDashboard({ initialStats, initialCheckIns, initialDebtors, initialAbsent, initialPlans });

  const canCreateMember = d.plans.length > 0;
  const goToTab = useCallback((tab: AdminTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const openNewMember = useCallback(() => {
    if (!canCreateMember) return;
    setNewMemberFormKey((k) => k + 1);
    setIsNewMemberOpen(true);
  }, [canCreateMember]);

  const q = searchQuery.trim();
  const match = (name: string, dni: string) => !q || matchesSearch(name, q) || dni.includes(q);
  const section = ADMIN_SECTIONS.find((s) => s.tab === activeTab) || ADMIN_SECTIONS[0];
  const SectionIcon = section.icon;
  const hideSearch = TABS_WITHOUT_GLOBAL_SEARCH.includes(activeTab);

  return (
    <div data-theme={theme} className="min-h-screen bg-fx-base text-fx-text flex flex-col">
      <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-7 pb-28 lg:pb-12">
        <div className="max-w-7xl mx-auto space-y-5">
          <HeaderStats
            stats={d.displayStats}
            onOpenNewMember={openNewMember}
            onRefresh={d.refreshAllData}
            isRefreshing={d.isRefreshing}
            theme={theme}
            onToggleTheme={toggleTheme}
            onGoToTab={goToTab}
            checkInScreenOnline={d.checkInScreenOnline}
            onOpenCheckInScreen={() => void dispatchScreens()}
            canCreateMember={canCreateMember}
          />

          <AdminSidebar
            activeTab={activeTab}
            onSelect={goToTab}
            counts={{
              LIVE_FEED: d.checkIns.length,
              DEBTORS: d.debtors.length,
              ABSENT: d.absentMembers.length,
            }}
            collapsed={sidebarCollapsed}
            onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
            mobileOpen={mobileMenuOpen}
            onOpenMobile={() => setMobileMenuOpen(true)}
            onCloseMobile={() => setMobileMenuOpen(false)}
            onOpenNewMember={openNewMember}
            canCreateMember={canCreateMember}
          />

          <PendingMembersBanner
            pending={d.pendingMembers.pending}
            isSyncing={d.pendingMembers.isSyncing}
            onSyncNow={() => void d.pendingMembers.syncNow()}
            onDiscard={(clientId) => void d.pendingMembers.discard(clientId)}
          />
          <PendingPhotosNotice />

          {d.feedbackBanner && (
            <div role="status" className="flex items-center gap-2.5 p-4 rounded-2xl bg-fx-green/15 border border-fx-green text-[15px] font-bold text-fx-green">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{d.feedbackBanner}</span>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            <div className="xl:col-span-3">
              <AdminKpiRail stats={d.displayStats} activeTab={activeTab} onGoToTab={goToTab} />
            </div>

            <main className="xl:col-span-9 min-w-0 flex flex-col rounded-3xl bg-fx-surface border border-fx-border border-t-4 border-t-fx-orange shadow-lg p-5 sm:p-7 gap-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-fx-border">
                <div className="flex items-center gap-3.5">
                  <span className="w-11 h-11 rounded-2xl bg-fx-orange/15 flex items-center justify-center shrink-0">
                    <SectionIcon className="w-5 h-5 text-fx-orangeText" />
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-fx-text">
                    {section.label}
                  </h2>
                </div>

                {!hideSearch && (
                  <div className="relative w-full lg:w-80">
                    <Search className="w-5 h-5 text-fx-muted absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar por nombre o DNI..."
                      className="w-full min-h-[48px] pl-12 pr-4 rounded-2xl bg-fx-base border border-fx-border focus:border-fx-orange focus:outline-none text-base text-fx-text"
                    />
                  </div>
                )}
              </div>

              <AdminActiveModule
                activeTab={activeTab}
                user={d.user}
                checkIns={d.checkIns}
                debtors={d.debtors}
                absentMembers={d.absentMembers}
                plans={d.plans}
                stats={d.displayStats}
                searchQuery={searchQuery}
                membersReloadKey={d.membersReloadKey}
                match={match}
                onEditMember={setEditingMemberId}
                onRegisterPayment={d.setSelectedDebtor}
                onShowToast={d.showToast}
                onMemberSynced={d.handleMemberSynced}
                onRefreshAll={d.refreshAllData}
                onGoToTab={goToTab}
              />
            </main>
          </div>
        </div>
      </div>

      <NewMemberModal
        key={newMemberFormKey}
        isOpen={isNewMemberOpen && canCreateMember}
        onClose={() => setIsNewMemberOpen(false)}
        plans={d.plans}
        onSubmitMember={d.handleCreateMember}
      />
      <MemberEditModal
        memberId={editingMemberId}
        plans={d.plans}
        onClose={() => setEditingMemberId(null)}
        onChanged={(msg) => {
          d.showToast(msg);
          d.setMembersReloadKey((k) => k + 1);
          void d.refreshAllData();
        }}
      />
      <PaymentModal
        key={d.selectedDebtor?.id ?? "none"}
        debtor={d.selectedDebtor}
        plans={d.plans}
        onClose={() => d.setSelectedDebtor(null)}
        onConfirmPayment={d.handleConfirmPayment}
      />
    </div>
  );
}
