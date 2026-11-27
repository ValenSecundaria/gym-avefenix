"use client";

import React from "react";
import { BarChart3, Search } from "lucide-react";
import type {
  AbsentMemberItem,
  DashboardStats,
  DebtorMemberItem,
  LiveCheckInItem,
  PlanOption,
} from "@/types";
import type { AuthenticatedUser } from "@/types/auth";
import type { AdminTab } from "./AdminDashboardClient";
import { ADMIN_SECTIONS } from "./AdminSidebar";
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
import { matchesSearch } from "@/lib/text";

const TABS_WITHOUT_GLOBAL_SEARCH: AdminTab[] = [
  "METRICS",
  "PAYMENTS",
  "PLANS",
  "SETTINGS",
  "TEACHER_ATTENDANCE",
];

interface AdminActiveModuleProps {
  activeTab: AdminTab;
  user: AuthenticatedUser | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  checkIns: LiveCheckInItem[];
  debtors: DebtorMemberItem[];
  absentMembers: AbsentMemberItem[];
  plans: PlanOption[];
  displayStats: DashboardStats;
  membersReloadKey: number;
  onEditMember: (id: string) => void;
  onSelectDebtor: (d: DebtorMemberItem) => void;
  onShowToast: (msg: string) => void;
  onRefreshAll: () => Promise<void>;
  onMemberSynced: (msg: string) => void;
  onGoToTab: (tab: AdminTab) => void;
}

export function AdminActiveModule({
  activeTab,
  user,
  searchQuery,
  onSearchChange,
  checkIns,
  debtors,
  absentMembers,
  plans,
  displayStats,
  membersReloadKey,
  onEditMember,
  onSelectDebtor,
  onShowToast,
  onRefreshAll,
  onMemberSynced,
  onGoToTab,
}: AdminActiveModuleProps) {
  const q = searchQuery.trim();
  const match = (name: string, dni: string) => !q || matchesSearch(name, q) || dni.includes(q);
  const section = ADMIN_SECTIONS.find((s) => s.tab === activeTab) || ADMIN_SECTIONS[0];
  const SectionIcon = section.icon;
  const hideSearch = TABS_WITHOUT_GLOBAL_SEARCH.includes(activeTab);

  return (
    <main className="w-full min-w-0 flex flex-col rounded-lg bg-fx-surface border-2 border-fx-border shadow-lg p-5 sm:p-6 gap-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-fx-border">
        <div className="flex items-center gap-3.5">
          <span className="w-10 h-10 rounded-md bg-fx-base border border-fx-orange/40 flex items-center justify-center shrink-0">
            <SectionIcon className="w-5 h-5 text-fx-orangeText" />
          </span>
          <div>
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-fx-muted block">
              MÓDULO OPERATIVO
            </span>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-fx-text">
              {section.label}
            </h2>
          </div>
        </div>

        {!hideSearch && (
          <div className="relative w-full lg:w-80">
            <Search className="w-5 h-5 text-fx-muted absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar socio por nombre o DNI..."
              className="w-full min-h-[48px] pl-12 pr-4 rounded-md bg-fx-base border border-fx-border focus:border-fx-orange focus:outline-none text-base text-fx-text"
            />
          </div>
        )}
      </div>

      {activeTab === "LIVE_FEED" && (
        <HistoricalAttendanceSection
          todayCheckIns={checkIns}
          onEditMember={onEditMember}
          onSuccessSync={onShowToast}
          searchFilter={(fullName, dni) => match(fullName, dni)}
        />
      )}
      {activeTab === "DEBTORS" && (
        <DebtorsTable
          debtors={debtors.filter((item) => match(item.fullName, item.dni))}
          onRegisterPayment={onSelectDebtor}
          onEditMember={onEditMember}
        />
      )}
      {activeTab === "ABSENT" && (
        <AbsentMembersTable
          absentMembers={absentMembers.filter((item) => match(item.fullName, item.dni))}
          onEditMember={onEditMember}
        />
      )}
      {activeTab === "MEMBERS" && (
        <MembersSection
          searchQuery={searchQuery}
          reloadKey={membersReloadKey}
          onEditMember={onEditMember}
          onSynced={onMemberSynced}
        />
      )}
      {activeTab === "PAYMENTS" && roleOf(user) !== "PROFESOR" && (
        <div className="hidden lg:block">
          <PaymentsManagerView plans={plans} />
        </div>
      )}
      {activeTab === "PLANS" && (
        <PlansAdminSection
          onChanged={(msg) => {
            onShowToast(msg);
            void onRefreshAll();
          }}
        />
      )}
      {activeTab === "TEACHER_ATTENDANCE" && <TeacherAttendanceSection />}
      {activeTab === "METRICS" && (
        <>
          <div className="hidden lg:block">
            <MetricsPanel stats={displayStats} onGoToTab={onGoToTab} />
          </div>
          <div className="lg:hidden p-8 text-center rounded-lg bg-fx-base border border-fx-border">
            <BarChart3 className="w-10 h-10 text-fx-muted mx-auto mb-3" />
            <p className="text-lg font-bold text-fx-text">Las métricas detalladas se visualizan en PC</p>
          </div>
        </>
      )}
      {activeTab === "SETTINGS" && (
        <div className="flex flex-col gap-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <GymPhoneSettings />
            <SystemTutorialsCard />
          </div>
          <WhatsAppModeSettings />
          <ProfessorAccountsSettings />
        </div>
      )}
    </main>
  );
}
