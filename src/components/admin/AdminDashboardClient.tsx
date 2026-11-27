"use client";

import React, { useState, useCallback } from "react";
import { CheckCircle2 } from "lucide-react";
import type {
  AbsentMemberItem,
  DashboardStats,
  DebtorMemberItem,
  LiveCheckInItem,
  PlanOption,
} from "@/types";
import { HeaderStats } from "./HeaderStats";
import { AdminKpiStrip } from "./AdminKpiStrip";
import { AdminSidebar } from "./AdminSidebar";
import { AdminActiveModule } from "./AdminActiveModule";
import { NewMemberModal } from "./NewMemberModal";
import { PaymentModal } from "./PaymentModal";
import { MemberEditModal } from "./MemberEditModal";
import { PendingMembersBanner } from "./PendingMembersBanner";
import { PendingPhotosNotice } from "./PendingPhotosNotice";
import { useAdminTheme, type AdminTheme } from "@/lib/use-admin-theme";
import { dispatchScreens } from "@/lib/screens/screen-dispatcher";
import { useAdminDashboard } from "./use-admin-dashboard";

export type AdminTab =
  | "LIVE_FEED"
  | "DEBTORS"
  | "PAYMENTS"
  | "ABSENT"
  | "MEMBERS"
  | "PLANS"
  | "TEACHER_ATTENDANCE"
  | "METRICS"
  | "SETTINGS";

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
  plans: initialPlans,
  initialTheme,
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("LIVE_FEED");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewMemberOpen, setIsNewMemberOpen] = useState(false);
  const [newMemberFormKey, setNewMemberFormKey] = useState(0);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useAdminTheme(initialTheme);

  const d = useAdminDashboard({
    initialStats,
    initialCheckIns,
    initialDebtors,
    initialAbsent,
    initialPlans,
  });

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

  return (
    <div data-theme={theme} className="min-h-screen bg-fx-base text-fx-text flex flex-col">
      <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-7 pb-28 lg:pb-12">
        <div className="max-w-7xl mx-auto space-y-4">
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

          <AdminKpiStrip stats={d.displayStats} activeTab={activeTab} onGoToTab={goToTab} />

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
            <div role="status" className="flex items-center gap-2.5 p-4 rounded-lg bg-fx-green/15 border border-fx-green text-[15px] font-bold text-fx-green">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{d.feedbackBanner}</span>
            </div>
          )}

          <AdminActiveModule
            activeTab={activeTab}
            user={d.user}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            checkIns={d.checkIns}
            debtors={d.debtors}
            absentMembers={d.absentMembers}
            plans={d.plans}
            displayStats={d.displayStats}
            membersReloadKey={d.membersReloadKey}
            onEditMember={setEditingMemberId}
            onSelectDebtor={d.setSelectedDebtor}
            onShowToast={d.showToast}
            onRefreshAll={d.refreshAllData}
            onMemberSynced={d.handleMemberSynced}
            onGoToTab={goToTab}
          />
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
