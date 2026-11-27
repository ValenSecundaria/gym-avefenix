"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  AbsentMemberItem,
  DashboardStats,
  DebtorMemberItem,
  LiveCheckInItem,
  PaymentMethodType,
  PlanOption,
} from "@/types";
import type { NewMemberFormValues } from "./NewMemberModal";
import { PROFESOR_HOME, roleOf } from "@/lib/auth/auth-constants";
import { usePendingMembers } from "@/lib/offline/use-pending-members";
import { usePhotoSync } from "@/lib/offline/use-local-photos";
import type { MemberSyncSummary } from "@/lib/offline/member-sync";
import { getDashboardOverview } from "@/actions/dashboard.actions";
import { getTodayCheckIns } from "@/actions/checkin.actions";
import { gymBroadcast } from "@/lib/screens/broadcast-channel";
import { useCheckInKeyForwarding } from "@/hooks/use-checkin-key-forwarding";
import { closeSecondaryScreen, closeCurrentScreen } from "@/lib/screens/screen-dispatcher";
import { useAuthSession } from "@/context/auth-session-context";
import { useBatchSync } from "@/hooks/use-batch-sync";
import { getTodayLocalCheckIns } from "./today-local-checkins";
import { confirmAdminPaymentFlow, createAdminMemberFlow } from "./admin-member-mutations";

interface UseAdminDashboardArgs {
  initialStats: DashboardStats;
  initialCheckIns: LiveCheckInItem[];
  initialDebtors: DebtorMemberItem[];
  initialAbsent: AbsentMemberItem[];
  initialPlans: PlanOption[];
}

export function useAdminDashboard({
  initialStats,
  initialCheckIns,
  initialDebtors,
  initialAbsent,
  initialPlans,
}: UseAdminDashboardArgs) {
  const [plans, setPlans] = useState<PlanOption[]>(initialPlans);
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [serverCheckIns, setServerCheckIns] = useState<LiveCheckInItem[]>(initialCheckIns);
  const [localCheckIns, setLocalCheckIns] = useState<LiveCheckInItem[]>([]);
  const [debtors, setDebtors] = useState<DebtorMemberItem[]>(initialDebtors);
  const [absentMembers, setAbsentMembers] = useState<AbsentMemberItem[]>(initialAbsent);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState<DebtorMemberItem | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);
  const [membersReloadKey, setMembersReloadKey] = useState(0);

  const { status: authStatus, refreshSession, user } = useAuthSession();
  useBatchSync();
  usePhotoSync();
  const checkInScreenOnline = useCheckInKeyForwarding();

  useEffect(() => {
    if (authStatus === "UNAUTHENTICATED") {
      window.location.replace("/login");
      return;
    }
    if (authStatus === "AUTHENTICATED" && roleOf(user) === "PROFESOR") {
      window.location.replace(PROFESOR_HOME);
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
  }, [authStatus, refreshSession, user]);

  const refreshInFlightRef = useRef(false);
  const reloadLocalCheckIns = useCallback(async () => {
    try {
      setLocalCheckIns(await getTodayLocalCheckIns());
    } catch {
      // IndexedDB no disponible
    }
  }, []);

  const refreshAllData = useCallback(async () => {
    if (refreshInFlightRef.current) return;
    refreshInFlightRef.current = true;
    setIsRefreshing(true);
    try {
      const [overviewRes, checkInsRes] = await Promise.all([getDashboardOverview(), getTodayCheckIns()]);
      if (overviewRes.success && overviewRes.data) {
        setStats(overviewRes.data.stats);
        setDebtors(overviewRes.data.debtors);
        setAbsentMembers(overviewRes.data.absentMembers);
        setPlans(overviewRes.data.plans);
      }
      if (checkInsRes.success && checkInsRes.data) setServerCheckIns(checkInsRes.data);
    } catch {
      // Sin conexión: mantiene estado actual
    } finally {
      await reloadLocalCheckIns();
      refreshInFlightRef.current = false;
      setIsRefreshing(false);
    }
  }, [reloadLocalCheckIns]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      gymBroadcast.postMessage({ type: "CLOSE_ALL_SCREENS" });
      closeSecondaryScreen();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    const kickoffId = window.setTimeout(() => void reloadLocalCheckIns(), 0);
    const interval = window.setInterval(refreshAllData, 15000);
    const unsubscribe = gymBroadcast.subscribe((msg) => {
      if (msg.type === "CHECKIN_LOGGED" && msg.checkIn) void reloadLocalCheckIns();
      else if (msg.type === "REFRESH_DASHBOARD") void refreshAllData();
      else if (msg.type === "CLOSE_ALL_SCREENS" || msg.type === "SESSION_LOGOUT") {
        closeSecondaryScreen();
        closeCurrentScreen();
      }
    });
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.clearTimeout(kickoffId);
      window.clearInterval(interval);
      unsubscribe();
    };
  }, [refreshAllData, reloadLocalCheckIns]);

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

  const handleCreateMember = (v: NewMemberFormValues) =>
    createAdminMemberFlow(v, plans, showToast, refreshAllData);

  const handleConfirmPayment = (payload: {
    memberId: string;
    planId: string;
    amount: number;
    method: PaymentMethodType;
    notes?: string;
  }) => confirmAdminPaymentFlow(payload, selectedDebtor, plans, showToast, refreshAllData);

  const handleMemberSynced = (message: string) => {
    showToast(message);
    setMembersReloadKey((k) => k + 1);
    void refreshAllData();
  };

  const checkIns = [...localCheckIns, ...serverCheckIns].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const displayStats: DashboardStats = { ...stats, todayCheckIns: stats.todayCheckIns + localCheckIns.length };

  return {
    user,
    plans,
    checkIns,
    debtors,
    absentMembers,
    displayStats,
    isRefreshing,
    selectedDebtor,
    setSelectedDebtor,
    feedbackBanner,
    membersReloadKey,
    setMembersReloadKey,
    checkInScreenOnline,
    pendingMembers,
    refreshAllData,
    showToast,
    handleCreateMember,
    handleConfirmPayment,
    handleMemberSynced,
  };
}
