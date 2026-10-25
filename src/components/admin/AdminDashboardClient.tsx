"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { CheckCircle2, Menu, Search } from "lucide-react";
import type {
  AbsentMemberItem,
  CachedMember,
  DashboardStats,
  DebtorMemberItem,
  LiveCheckInItem,
  PaymentMethodType,
  PlanOption,
} from "@/types";
import { HeaderStats } from "./HeaderStats";
import { BatchSyncBadge } from "./BatchSyncBadge";
import { LiveFeedTable } from "./LiveFeedTable";
import { DebtorsTable } from "./DebtorsTable";
import { AbsentMembersTable } from "./AbsentMembersTable";
import { MetricsPanel } from "./MetricsPanel";
import { ADMIN_SECTIONS, AdminSidebar } from "./AdminSidebar";
import { NewMemberModal, type NewMemberFormValues } from "./NewMemberModal";
import { PaymentModal } from "./PaymentModal";
import { PendingMembersBanner } from "./PendingMembersBanner";
import { MembersSection } from "./MembersSection";
import { MemberEditModal } from "./MemberEditModal";
import { PlansAdminSection } from "./PlansAdminSection";
import { GymPhoneSettings } from "./gym-phone-settings";
import { enqueuePendingMember, PendingDniError } from "@/lib/offline/pending-members-store";
import { usePendingMembers } from "@/lib/offline/use-pending-members";
import type { MemberSyncSummary } from "@/lib/offline/member-sync";
import { createMember } from "@/actions/members.actions";
import { registerPayment } from "@/actions/payments.actions";
import { getDashboardOverview } from "@/actions/dashboard.actions";
import { getTodayCheckIns } from "@/actions/checkin.actions";
import { useAdminTheme, type AdminTheme } from "@/lib/use-admin-theme";
import { gymBroadcast } from "@/lib/screens/broadcast-channel";
import { useAuthSession } from "@/context/auth-session-context";
import { matchesSearch } from "@/lib/text";
import { useBatchSync } from "@/hooks/use-batch-sync";
import { saveMembersToCache, updateMemberInCache, getMemberFromCache } from "@/lib/db/indexed-db";

export type AdminTab = "LIVE_FEED" | "DEBTORS" | "ABSENT" | "MEMBERS" | "PLANS" | "METRICS" | "SETTINGS";

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
  const [plans, setPlans] = useState<PlanOption[]>(initialPlans);
  const [activeTab, setActiveTab] = useState<AdminTab>("LIVE_FEED");
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [checkIns, setCheckIns] = useState<LiveCheckInItem[]>(initialCheckIns);
  const [debtors, setDebtors] = useState<DebtorMemberItem[]>(initialDebtors);
  const [absentMembers, setAbsentMembers] = useState<AbsentMemberItem[]>(initialAbsent);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isNewMemberOpen, setIsNewMemberOpen] = useState(false);
  const [newMemberFormKey, setNewMemberFormKey] = useState(0);
  const [selectedDebtor, setSelectedDebtor] = useState<DebtorMemberItem | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [membersReloadKey, setMembersReloadKey] = useState(0);
  const { theme, toggleTheme } = useAdminTheme(initialTheme);
  const { status: authStatus, refreshSession } = useAuthSession();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  const {
    pendingCount: batchPendingCount,
    formattedCountdown: batchCountdown,
    isSyncing: isBatchSyncing,
    flushQueue: flushBatchQueue,
  } = useBatchSync();

  useEffect(() => {
    if (authStatus === "UNAUTHENTICATED") {
      window.location.replace("/login");
      return;
    }
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        refreshSession().then((s) => {
          if (!s) window.location.replace("/login");
        });
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [authStatus, refreshSession]);

  const refreshAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [overviewRes, checkInsRes] = await Promise.all([getDashboardOverview(), getTodayCheckIns()]);
      if (overviewRes.success && overviewRes.data) {
        setStats(overviewRes.data.stats);
        setDebtors(overviewRes.data.debtors);
        setAbsentMembers(overviewRes.data.absentMembers);
        setPlans(overviewRes.data.plans);
      }
      if (checkInsRes.success && checkInsRes.data) setCheckIns(checkInsRes.data);
    } catch {
      // Sin conexión: se mantienen los datos previos
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const interval = window.setInterval(refreshAllData, 15000);
    const unsubscribe = gymBroadcast.subscribe((msg) => {
      if (msg.type === "CHECKIN_LOGGED" && msg.checkIn) {
        setCheckIns((prev) => {
          if (prev.some((c) => c.id === msg.checkIn.id)) return prev;
          return [msg.checkIn, ...prev];
        });
        setStats((prev) => ({
          ...prev,
          todayCheckIns: prev.todayCheckIns + 1,
        }));
      } else if (msg.type === "REFRESH_DASHBOARD") {
        refreshAllData();
      } else if (msg.type === "SESSION_LOGOUT") {
        window.location.replace("/login");
      }
    });
    return () => {
      window.clearInterval(interval);
      unsubscribe();
    };
  }, [refreshAllData]);

  const toastTimerRef = useRef<number | null>(null);
  const showToast = useCallback((msg: string) => {
    setFeedbackBanner(msg);
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setFeedbackBanner(null), 5000);
  }, []);

  const handleMembersSynced = useCallback(
    (summary: MemberSyncSummary) => {
      const total = summary.created + summary.alreadySynced;
      showToast(
        total === 1
          ? "Volvió la conexión: se subió 1 socio guardado en esta PC."
          : `Volvió la conexión: se subieron ${total} socios guardados en esta PC.`
      );
      void refreshAllData();
    },
    [refreshAllData, showToast]
  );
  const pendingMembers = usePendingMembers(handleMembersSynced);

  const handleCreateMember = async (v: NewMemberFormValues) => {
    const input = { ...v, photoBase64: v.photoBase64 || undefined };

    const saveOffline = async () => {
      try {
        await enqueuePendingMember(input);
        showToast(`Sin conexión: ${v.fullName} quedó guardado en esta PC y se subirá solo al volver internet.`);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof PendingDniError ? error.message : "No se pudo guardar el alta en esta PC.",
        };
      }
    };

    if (typeof navigator !== "undefined" && navigator.onLine === false) return saveOffline();

    let res;
    try {
      res = await createMember(input);
    } catch {
      return saveOffline();
    }
    if (res.success && res.data) {
      const createdItem = res.data;
      const cached: CachedMember = {
        id: createdItem.id,
        dni: createdItem.dni,
        fullName: createdItem.fullName,
        photoFilename: createdItem.photoFilename,
        planName: createdItem.planName,
        allowedDays: null,
        validUntil: createdItem.validUntil,
        weeklyCheckIns: 0,
      };
      saveMembersToCache([cached]).catch(() => { });
      gymBroadcast.postMessage({ type: "MEMBER_UPDATED", member: cached });
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
      if (selectedDebtor) {
        updateMemberInCache(selectedDebtor.dni, {
          validUntil: res.data.validUntil,
          planName: res.data.planName,
        })
          .then(() => getMemberFromCache(selectedDebtor.dni))
          .then((updated) => {
            if (updated) gymBroadcast.postMessage({ type: "MEMBER_UPDATED", member: updated });
          })
          .catch(() => { });
      }
      showToast(`Pago registrado (${res.data.planName}). Membresía renovada.`);
      await refreshAllData();
    }
    return { success: res.success, error: res.error };
  };

  const handleSyncBatchNow = async () => {
    const res = await flushBatchQueue();
    if (res.success && res.count > 0) {
      showToast(`Lote sincronizado: ${res.count} ingreso(s) enviados a Neon.`);
      void refreshAllData();
    } else if (res.success && res.count === 0) {
      showToast("No hay ingresos pendientes para sincronizar en la cola.");
    } else {
      showToast("Error al sincronizar el lote. Se reintentará automáticamente.");
    }
  };

  const q = searchQuery.trim();
  const match = (name: string, dni: string) => !q || matchesSearch(name, q) || dni.includes(q);
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
          <HeaderStats
            stats={stats}
            onOpenNewMember={() => {
              setNewMemberFormKey((k) => k + 1);
              setIsNewMemberOpen(true);
            }}
            onRefresh={refreshAllData}
            isRefreshing={isRefreshing}
            theme={theme}
            onToggleTheme={toggleTheme}
            batchSyncSlot={
              <BatchSyncBadge
                pendingCount={batchPendingCount}
                formattedCountdown={batchCountdown}
                isSyncing={isBatchSyncing}
                onSyncNow={handleSyncBatchNow}
              />
            }
          />

          <PendingMembersBanner
            pending={pendingMembers.pending}
            isSyncing={pendingMembers.isSyncing}
            onSyncNow={() => void pendingMembers.syncNow()}
            onDiscard={(clientId) => void pendingMembers.discard(clientId)}
          />

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

              <div className={`relative w-full lg:w-72 ${activeTab === "METRICS" || activeTab === "PLANS" || activeTab === "SETTINGS" ? "hidden" : ""}`}>
                <Search className="w-4 h-4 text-fx-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por DNI o apellido..."
                  className="w-full min-h-[48px] pl-10 pr-4 rounded-xl bg-fx-base border border-fx-border focus:border-fx-orange focus:outline-none text-sm text-fx-text"
                />
              </div>
            </div>

            {activeTab === "LIVE_FEED" && (
              <LiveFeedTable
                items={checkIns.filter((c) => match(c.fullName, c.dni))}
                onEditMember={setEditingMemberId}
              />
            )}
            {activeTab === "DEBTORS" && (
              <DebtorsTable
                debtors={debtors.filter((d) => match(d.fullName, d.dni))}
                onRegisterPayment={setSelectedDebtor}
                onEditMember={setEditingMemberId}
              />
            )}
            {activeTab === "ABSENT" && (
              <AbsentMembersTable
                absentMembers={absentMembers.filter((a) => match(a.fullName, a.dni))}
                onEditMember={setEditingMemberId}
              />
            )}
            {activeTab === "MEMBERS" && (
              <MembersSection
                searchQuery={searchQuery}
                reloadKey={membersReloadKey}
                onEditMember={setEditingMemberId}
              />
            )}
            {activeTab === "PLANS" && (
              <PlansAdminSection
                onChanged={(msg) => {
                  showToast(msg);
                  void refreshAllData();
                }}
              />
            )}
            {activeTab === "METRICS" && <MetricsPanel stats={stats} onGoToTab={setActiveTab} />}
            {activeTab === "SETTINGS" && <GymPhoneSettings />}
          </div>
        </div>
      </div>

      <NewMemberModal
        key={newMemberFormKey}
        isOpen={isNewMemberOpen}
        onClose={() => setIsNewMemberOpen(false)}
        plans={plans}
        onSubmitMember={handleCreateMember}
      />
      <MemberEditModal
        memberId={editingMemberId}
        onClose={() => setEditingMemberId(null)}
        onChanged={(msg) => {
          showToast(msg);
          setMembersReloadKey((k) => k + 1);
          void refreshAllData();
        }}
      />
      <PaymentModal
        key={selectedDebtor?.id ?? "none"}
        debtor={selectedDebtor}
        plans={plans}
        onClose={() => setSelectedDebtor(null)}
        onConfirmPayment={handleConfirmPayment}
      />
    </div>
  );
}
