"use client";

import { useCallback, useEffect, useState } from "react";
import type { DashboardStats, PaymentMethodType, PlanOption, StaffMemberItem, StaffMembersPage, StaffMemberStatus } from "@/types";
import { ADMIN_HOME, roleOf } from "@/lib/auth/auth-constants";
import { getStaffOverview } from "@/actions/dashboard.actions";
import { getStaffMembersPage } from "@/actions/staff.actions";
import { createMember } from "@/actions/members.actions";
import { registerPayment } from "@/actions/payments.actions";
import type { NewMemberFormValues } from "@/components/admin/NewMemberModal";

export function useProfessorDashboard(initialStats: DashboardStats, initialPlans: PlanOption[], authStatus: string, user: any) {
  const [stats, setStats] = useState(initialStats);
  const [plans, setPlans] = useState(initialPlans);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StaffMemberStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [listKey, setListKey] = useState(0);
  const [data, setData] = useState<StaffMembersPage | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authStatus === "UNAUTHENTICATED") window.location.replace("/login");
    else if (authStatus === "AUTHENTICATED" && roleOf(user) === "ADMIN") window.location.replace(ADMIN_HOME);
  }, [authStatus, user]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    getStaffMembersPage({ search: search || undefined, status: statusFilter, page })
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) {
          setData(res.data);
          setListError(null);
        } else setListError(res.error || "No se pudo cargar el listado.");
      })
      .catch(() => !cancelled && setListError("Sin conexión: no se pudo cargar el listado."))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [search, statusFilter, page, listKey]);

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    setIsLoading(true);
    setListKey((k) => k + 1);
    try {
      const res = await getStaffOverview();
      if (res.success && res.data) {
        setStats(res.data.stats);
        setPlans(res.data.plans);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleCreateMember = async (v: NewMemberFormValues) => {
    try {
      const res = await createMember({ ...v, photoBase64: v.photoBase64 || undefined });
      if (res.success) {
        setToast(`Socio ${v.fullName} registrado y habilitado.`);
        void refreshAll();
      }
      return { success: res.success, error: res.error };
    } catch {
      return { success: false, error: "Sin conexión: el alta no se guardó." };
    }
  };

  const handleConfirmPayment = async (p: { memberId: string; planId: string; method: PaymentMethodType; notes?: string }) => {
    const res = await registerPayment(p);
    if (res.success && res.data) {
      setToast(`Pago registrado (${res.data.planName}). Cuota renovada.`);
      void refreshAll();
    }
    return { success: res.success, error: res.error };
  };

  return {
    stats,
    plans,
    isRefreshing,
    toast,
    searchInput,
    setSearchInput,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    data,
    listError,
    isLoading,
    setIsLoading,
    refreshAll,
    handleCreateMember,
    handleConfirmPayment,
  };
}
