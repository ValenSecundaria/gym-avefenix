"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Flame,
  Loader2,
  Moon,
  RefreshCw,
  Search,
  Sun,
  UserPlus,
  Users,
} from "lucide-react";
import type {
  DashboardStats,
  PaymentMethodType,
  PlanOption,
  StaffMemberItem,
  StaffMembersPage,
  StaffMemberStatus,
} from "@/types";
import { useAdminTheme, type AdminTheme } from "@/lib/use-admin-theme";
import { useAuthSession } from "@/context/auth-session-context";
import { ADMIN_HOME, roleOf } from "@/lib/auth/auth-constants";
import { getStaffOverview } from "@/actions/dashboard.actions";
import { getStaffMembersPage } from "@/actions/staff.actions";
import { createMember } from "@/actions/members.actions";
import { registerPayment } from "@/actions/payments.actions";
import { NewMemberModal, type NewMemberFormValues } from "@/components/admin/NewMemberModal";
import { MetricsPanel } from "@/components/admin/MetricsPanel";
import { LogoutButton } from "@/components/admin/logout-button";
import { NO_PLANS_HINT } from "@/components/admin/HeaderStats";
import { StaffPaymentModal } from "./StaffPaymentModal";

type ProfessorTab = "CLIENTS" | "METRICS";
type StatusFilter = StaffMemberStatus | "ALL";

const STATUS_BADGE: Record<StaffMemberStatus, { text: string; cls: string }> = {
  AL_DIA: { text: "Al día", cls: "bg-fx-green/15 text-fx-green border-fx-green/40" },
  VENCIDA: { text: "Cuota vencida", cls: "bg-fx-red/15 text-fx-red border-fx-red/40" },
  SIN_PLAN: { text: "Sin plan", cls: "bg-fx-hover text-fx-muted border-fx-border" },
};

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "AL_DIA", label: "Al día" },
  { value: "VENCIDA", label: "Vencidos" },
  { value: "SIN_PLAN", label: "Sin plan" },
];

const ICON_BTN =
  "min-h-[48px] min-w-[48px] px-3 rounded-xl bg-fx-base hover:bg-fx-hover border border-fx-border text-sm font-bold text-fx-muted hover:text-fx-text inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50";

const SEARCH_DEBOUNCE_MS = 300;

interface ProfessorDashboardClientProps {
  initialStats: DashboardStats;
  initialPlans: PlanOption[];
  initialTheme: AdminTheme;
  professorName: string;
}

// Panel de la cuenta de profesor: altas, cobros, estado de clientes (nombre, DNI y cuota) y métricas sin plata.
export function ProfessorDashboardClient({ initialStats, initialPlans, initialTheme, professorName }: ProfessorDashboardClientProps) {
  const { theme, toggleTheme } = useAdminTheme(initialTheme);
  const { status: authStatus, user } = useAuthSession();
  const [activeTab, setActiveTab] = useState<ProfessorTab>("CLIENTS");
  const [stats, setStats] = useState(initialStats);
  const [plans, setPlans] = useState(initialPlans);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [listKey, setListKey] = useState(0);
  const [data, setData] = useState<StaffMembersPage | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isNewMemberOpen, setIsNewMemberOpen] = useState(false);
  const [newMemberFormKey, setNewMemberFormKey] = useState(0);
  const [payingMember, setPayingMember] = useState<StaffMemberItem | null>(null);

  const canCreateMember = plans.length > 0;
  const displayName = user?.name || professorName;

  // Sin conexión el proxy no corre: si la sesión es de administración, va a su panel.
  useEffect(() => {
    if (authStatus === "UNAUTHENTICATED") window.location.replace("/login");
    else if (authStatus === "AUTHENTICATED" && roleOf(user) === "ADMIN") window.location.replace(ADMIN_HOME);
  }, [authStatus, user]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
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
        } else {
          setListError(res.error || "No se pudo cargar el listado de clientes.");
        }
      })
      .catch(() => !cancelled && setListError("Sin conexión: no se pudo cargar el listado de clientes."))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [search, statusFilter, page, listKey]);

  const toastTimerRef = useRef<number | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 5000);
  }, []);

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
    } catch {
      // Sin conexión: se mantienen los datos previos
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const changeFilter = (value: StatusFilter) => {
    setStatusFilter(value);
    setPage(1);
    setIsLoading(true);
  };

  const goToPage = (next: number) => {
    setPage(next);
    setIsLoading(true);
  };

  const openNewMember = () => {
    if (!canCreateMember) return;
    setNewMemberFormKey((k) => k + 1);
    setIsNewMemberOpen(true);
  };

  const handleCreateMember = async (v: NewMemberFormValues) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return { success: false, error: "Sin conexión: el alta no se guardó. Probá de nuevo cuando vuelva internet." };
    }
    try {
      const res = await createMember({ ...v, photoBase64: v.photoBase64 || undefined });
      if (res.success) {
        showToast(`Socio ${v.fullName} registrado y habilitado.`);
        void refreshAll();
      }
      return { success: res.success, error: res.error };
    } catch {
      return { success: false, error: "Sin conexión: el alta no se guardó." };
    }
  };

  const handleConfirmPayment = async (payload: { memberId: string; planId: string; method: PaymentMethodType; notes?: string }) => {
    const res = await registerPayment(payload);
    if (res.success && res.data) {
      showToast(`Pago registrado (${res.data.planName}). Cuota renovada.`);
      void refreshAll();
    }
    return { success: res.success, error: res.error };
  };

  const ThemeIcon = theme === "light" ? Moon : Sun;
  const themeLabel = theme === "light" ? "Modo oscuro" : "Modo claro";
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div data-theme={theme} className="min-h-screen bg-fx-base text-fx-text">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-fx-surface border border-fx-border shadow-lg">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fx-orange to-fx-red flex items-center justify-center shrink-0">
              <Flame className="w-7 h-7 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold text-fx-text tracking-tight">
                Ave Fénix <span className="text-fx-orange">• Profesores</span>
              </h1>
              <p className="text-sm text-fx-muted truncate">Hola, {displayName}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button type="button" onClick={() => void refreshAll()} disabled={isRefreshing} aria-label="Actualizar datos" className={ICON_BTN}>
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin text-fx-orange" : ""}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
            <button type="button" onClick={toggleTheme} aria-label={themeLabel} title={themeLabel} className={ICON_BTN}>
              <ThemeIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={openNewMember}
              disabled={!canCreateMember}
              title={canCreateMember ? undefined : NO_PLANS_HINT}
              className="min-h-[52px] px-5 rounded-xl bg-fx-orange hover:bg-fx-orange/90 text-white font-extrabold text-base inline-flex items-center gap-2.5 shadow-[0_4px_16px_rgba(249,87,22,0.35)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <UserPlus className="w-5 h-5" />
              <span>Nuevo socio</span>
            </button>
            <div className="w-full sm:w-48">
              <LogoutButton />
            </div>
          </div>
        </header>

        {!canCreateMember && (
          <div role="status" className="flex items-center gap-2.5 p-4 rounded-2xl bg-fx-amber/15 border border-fx-amber/50 text-sm font-bold text-fx-amber">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>No hay planes a la venta: no se pueden dar altas ni cobrar hasta que la administración cargue uno.</span>
          </div>
        )}

        {toast && (
          <div role="status" className="flex items-center gap-2.5 p-4 rounded-2xl bg-fx-green/15 border border-fx-green text-sm font-bold text-fx-green">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        <div className="flex flex-col rounded-2xl bg-fx-surface border border-fx-border shadow-lg p-4 sm:p-6 gap-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-fx-border">
            <div className="flex gap-2" role="tablist" aria-label="Secciones">
              {([
                { tab: "CLIENTS", label: "Clientes", icon: Users },
                { tab: "METRICS", label: "Métricas", icon: BarChart3 },
              ] as const).map(({ tab, label, icon: Icon }) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`min-h-[48px] px-5 rounded-xl inline-flex items-center gap-2 text-base font-bold transition-colors cursor-pointer ${
                    activeTab === tab ? "bg-fx-orange text-white" : "text-fx-muted hover:text-fx-text hover:bg-fx-hover"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>

            {activeTab === "CLIENTS" && (
              <div className="relative w-full lg:w-80">
                <Search className="w-5 h-5 text-fx-muted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Buscar por nombre o DNI..."
                  aria-label="Buscar cliente por nombre o DNI"
                  className="w-full min-h-[52px] pl-12 pr-4 rounded-xl bg-fx-base border-2 border-fx-border focus:border-fx-orange focus:outline-none text-base text-fx-text"
                />
              </div>
            )}
          </div>

          {activeTab === "CLIENTS" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por estado de la cuota">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => changeFilter(f.value)}
                    aria-pressed={statusFilter === f.value}
                    className={`min-h-[40px] px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      statusFilter === f.value ? "bg-fx-orange text-white" : "bg-fx-surface border border-fx-border text-fx-muted hover:text-fx-text"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
                {isLoading && <Loader2 className="w-4 h-4 animate-spin text-fx-orange" aria-label="Cargando" />}
                {data && <span className="ml-auto text-xs text-fx-muted">{data.total} clientes</span>}
              </div>

              {listError && (
                <div role="alert" className="flex items-center gap-2 p-3 rounded-xl bg-fx-red/20 border border-fx-red text-sm text-fx-text">
                  <AlertCircle className="w-4 h-4 text-fx-red shrink-0" />
                  <span>{listError}</span>
                </div>
              )}

              {data && data.items.length === 0 && !isLoading ? (
                <p className="p-8 text-center text-sm text-fx-muted rounded-xl border border-dashed border-fx-border">
                  No hay clientes que coincidan.
                </p>
              ) : (
                data && (
                  <ul className={`flex flex-col divide-y divide-fx-border rounded-xl border border-fx-border bg-fx-base transition-opacity ${isLoading ? "opacity-60" : ""}`}>
                    {data.items.map((m) => {
                      const badge = STATUS_BADGE[m.status];
                      return (
                        <li key={m.id} className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-bold text-fx-text truncate">{m.fullName}</div>
                            <div className="text-xs font-mono text-fx-muted">DNI {m.dni}</div>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className={`px-2.5 py-1 rounded-md border text-xs font-bold ${badge.cls}`}>{badge.text}</span>
                            <button
                              type="button"
                              onClick={() => setPayingMember(m)}
                              disabled={!canCreateMember}
                              className="min-h-[44px] px-3.5 rounded-xl bg-fx-surface border border-fx-border hover:bg-fx-hover text-sm font-bold text-fx-text inline-flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <CreditCard className="w-4 h-4 text-fx-orange" />
                              Registrar pago
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )
              )}

              {data && totalPages > 1 && (
                <div className="flex items-center justify-center gap-3">
                  <button type="button" onClick={() => goToPage(data.page - 1)} disabled={data.page <= 1 || isLoading} aria-label="Página anterior" className={ICON_BTN}>
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-fx-muted">
                    Página {data.page} de {totalPages}
                  </span>
                  <button type="button" onClick={() => goToPage(data.page + 1)} disabled={data.page >= totalPages || isLoading} aria-label="Página siguiente" className={ICON_BTN}>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "METRICS" && (
            <>
              {/* Los gráficos no entran bien en el celular: ahí no se muestran. */}
              <div className="hidden lg:block">
                <MetricsPanel
                  stats={stats}
                  hideMoney
                  onGoToTab={(tab) => {
                    setActiveTab("CLIENTS");
                    changeFilter(tab === "DEBTORS" ? "VENCIDA" : "ALL");
                  }}
                />
              </div>
              <div className="lg:hidden p-8 text-center rounded-2xl bg-fx-base border border-fx-border">
                <BarChart3 className="w-10 h-10 text-fx-muted mx-auto mb-3" />
                <p className="text-lg font-bold text-fx-text">Las métricas se ven en la computadora</p>
              </div>
            </>
          )}
        </div>
      </div>

      <NewMemberModal
        key={newMemberFormKey}
        isOpen={isNewMemberOpen && canCreateMember}
        onClose={() => setIsNewMemberOpen(false)}
        plans={plans}
        onSubmitMember={handleCreateMember}
        hidePrices
      />
      <StaffPaymentModal
        key={payingMember?.id ?? "none"}
        member={payingMember}
        plans={plans}
        registeredByName={displayName}
        onClose={() => setPayingMember(null)}
        onConfirm={handleConfirmPayment}
      />
    </div>
  );
}
