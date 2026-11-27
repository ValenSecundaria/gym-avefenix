"use client";

import React from "react";
import { BarChart3 } from "lucide-react";
import type {
  AbsentMemberItem,
  DashboardStats,
  DebtorMemberItem,
  LiveCheckInItem,
  PlanOption,
} from "@/types";
import type { AuthenticatedUser } from "@/types/auth";
import type { AdminTab } from "./AdminDashboardClient";
import { HistoricalAttendanceSection } from "./attendance/historical-attendance-section";
import { DebtorsTable } from "./DebtorsTable";
import { AbsentMembersTable } from "./AbsentMembersTable";
import { MembersSection } from "./MembersSection";
import { PaymentsManagerView } from "./payments/payments-manager-view";
import { PlansAdminSection } from "./PlansAdminSection";
import { TeacherAttendanceSection } from "./teacher-attendance/teacher-attendance-section";
import { MetricsPanel } from "./MetricsPanel";
import { GymPhoneSettings } from "./gym-phone-settings";
import { SystemTutorialsCard } from "./SystemTutorialsCard";
import { WhatsAppModeSettings } from "./WhatsAppModeSettings";
import { ProfessorAccountsSettings } from "./ProfessorAccountsSettings";
import { roleOf } from "@/lib/auth/auth-constants";

interface AdminActiveModuleProps {
  activeTab: AdminTab;
  user: AuthenticatedUser | null;
  checkIns: LiveCheckInItem[];
  debtors: DebtorMemberItem[];
  absentMembers: AbsentMemberItem[];
  plans: PlanOption[];
  stats: DashboardStats;
  searchQuery: string;
  membersReloadKey: number;
  match: (fullName: string, dni: string) => boolean;
  onEditMember: (memberId: string) => void;
  onRegisterPayment: (debtor: DebtorMemberItem) => void;
  onShowToast: (msg: string) => void;
  onMemberSynced: (msg: string) => void;
  onRefreshAll: () => Promise<void>;
  onGoToTab: (tab: AdminTab) => void;
}

export function AdminActiveModule({
  activeTab,
  user,
  checkIns,
  debtors,
  absentMembers,
  plans,
  stats,
  searchQuery,
  membersReloadKey,
  match,
  onEditMember,
  onRegisterPayment,
  onShowToast,
  onMemberSynced,
  onRefreshAll,
  onGoToTab,
}: AdminActiveModuleProps) {
  if (activeTab === "LIVE_FEED") {
    return (
      <HistoricalAttendanceSection
        todayCheckIns={checkIns}
        onEditMember={onEditMember}
        onSuccessSync={onShowToast}
        searchFilter={match}
      />
    );
  }
  if (activeTab === "DEBTORS") {
    return (
      <DebtorsTable
        debtors={debtors.filter((item) => match(item.fullName, item.dni))}
        onRegisterPayment={onRegisterPayment}
        onEditMember={onEditMember}
      />
    );
  }
  if (activeTab === "ABSENT") {
    return (
      <AbsentMembersTable
        absentMembers={absentMembers.filter((item) => match(item.fullName, item.dni))}
        onEditMember={onEditMember}
      />
    );
  }
  if (activeTab === "MEMBERS") {
    return (
      <MembersSection
        searchQuery={searchQuery}
        reloadKey={membersReloadKey}
        onEditMember={onEditMember}
        onSynced={onMemberSynced}
      />
    );
  }
  if (activeTab === "PAYMENTS" && roleOf(user) !== "PROFESOR") {
    return (
      <div className="hidden lg:block">
        <PaymentsManagerView plans={plans} />
      </div>
    );
  }
  if (activeTab === "PLANS") {
    return (
      <PlansAdminSection
        onChanged={(msg) => {
          onShowToast(msg);
          void onRefreshAll();
        }}
      />
    );
  }
  if (activeTab === "TEACHER_ATTENDANCE") {
    return <TeacherAttendanceSection />;
  }
  if (activeTab === "METRICS") {
    return (
      <>
        <div className="hidden lg:block">
          <MetricsPanel stats={stats} onGoToTab={onGoToTab} />
        </div>
        <div className="lg:hidden p-8 text-center rounded-2xl bg-fx-base border border-fx-border">
          <BarChart3 className="w-10 h-10 text-fx-muted mx-auto mb-3" />
          <p className="text-lg font-bold text-fx-text">Las métricas se ven en la computadora</p>
        </div>
      </>
    );
  }
  if (activeTab === "SETTINGS") {
    return (
      <div className="flex flex-col gap-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <GymPhoneSettings />
          <SystemTutorialsCard />
        </div>
        <WhatsAppModeSettings />
        <ProfessorAccountsSettings />
      </div>
    );
  }
  return null;
}
