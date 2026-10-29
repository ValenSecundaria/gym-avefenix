"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { BarChart3, CheckCircle2, Search } from "lucide-react";
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
import { gymBroadcast, toCheckInKey } from "@/lib/screens/broadcast-channel";
import { dispatchScreens } from "@/lib/screens/screen-dispatcher";
import { useAuthSession } from "@/context/auth-session-context";
import { matchesSearch } from "@/lib/text";
import { useBatchSync } from "@/hooks/use-batch-sync";
import {
  saveMembersToCache,
  updateMemberInCache,
  getMemberFromCache,
  getPendingCheckIns,
} from "@/lib/db/indexed-db";
import { getMemberPhotoUrl } from "@/lib/utils";

// Ingresos de hoy que siguen en la cola local (todavía no subidos a la base en el lote horario).
// La lista del servidor no los tiene: sin esto, cada refresco "borraba" los ingresos del día.
async function getTodayLocalCheckIns(): Promise<LiveCheckInItem[]> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const pending = await getPendingCheckIns();
  const items: LiveCheckInItem[] = [];
  for (const p of pending) {
    if (new Date(p.createdAt) < startOfToday) continue;
    // Ingresos encolados antes de que la cola guardara el nombre: se completan con la caché de socios.
    const cached = p.fullName ? undefined : await getMemberFromCache(p.dni);
    items.push({
      id: `pending_${p.id}`,
      memberId: p.memberId,
      dni: p.dni,
      fullName: p.fullName ?? cached?.fullName ?? `DNI ${p.dni}`,
      photoUrl: getMemberPhotoUrl(p.dni, p.photoFilename ?? cached?.photoFilename),
      planName: p.planName ?? cached?.planName ?? "Sin plan",
      status: p.status,
      createdAt: p.createdAt,
    });
  }
  return items;
}

/** Si la pantalla de ingreso no da señales en este tiempo, se considera cerrada. */
const CHECKIN_ALIVE_TIMEOUT_MS = 6000;

const NON_TEXT_INPUT_TYPES = new Set(["button", "submit", "reset", "checkbox", "radio", "range", "color", "file", "image"]);

/** Hay un campo del panel donde se está escribiendo (buscador, alta, montos...). */
function isEditableElement(el: Element | null): boolean {
  if (!el) return false;
  if (el instanceof HTMLInputElement) return !NON_TEXT_INPUT_TYPES.has(el.type);
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return true;
  return el instanceof HTMLElement && el.isContentEditable;
}

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
  const [serverCheckIns, setServerCheckIns] = useState<LiveCheckInItem[]>(initialCheckIns);
  const [localCheckIns, setLocalCheckIns] = useState<LiveCheckInItem[]>([]);
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

  // Sigue enviando los ingresos por lote en segundo plano; ya no se muestra en pantalla.
  useBatchSync();

  // Pantalla de ingreso (Check-In): se sabe que está abierta por su latido.
  const [checkInScreenOnline, setCheckInScreenOnline] = useState(false);
  const lastCheckInAliveRef = useRef(0);

  useEffect(() => {
    const unsubscribe = gymBroadcast.subscribe((msg) => {
      if (msg.type === "CHECKIN_ALIVE") {
        lastCheckInAliveRef.current = Date.now();
        setCheckInScreenOnline(true);
      }
    });
    const watchdog = window.setInterval(() => {
      if (Date.now() - lastCheckInAliveRef.current > CHECKIN_ALIVE_TIMEOUT_MS) setCheckInScreenOnline(false);
    }, 2000);

    // El teclado numérico es exclusivo de la pantalla de ingreso: aunque el mouse esté
    // usando este panel, cada tecla del numpad se reenvía al Check-In. Si no se está
    // escribiendo en un campo del panel, también se reenvían Borrar, Enter y los números comunes.
    const onKeyDown = (e: KeyboardEvent) => {
      if (Date.now() - lastCheckInAliveRef.current > CHECKIN_ALIVE_TIMEOUT_MS) return;
      const typingInPanel = isEditableElement(document.activeElement);
      // Escape queda para el panel (cerrar ventanas y menús).
      if (!typingInPanel && e.key === "Escape") return;
      const key = toCheckInKey(e, typingInPanel);
      if (!key) return;
      e.preventDefault();
      e.stopPropagation();
      gymBroadcast.postMessage({ type: "CHECKIN_KEY", key });
    };
    window.addEventListener("keydown", onKeyDown, true);

    return () => {
      unsubscribe();
      window.clearInterval(watchdog);
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);

  const goToTab = useCallback((tab: AdminTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const openNewMember = useCallback(() => {
    setNewMemberFormKey((k) => k + 1);
    setIsNewMemberOpen(true);
  }, []);

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

  // Las Server Actions se ejecutan en fila: si una actualización quedó esperando (red lenta),
  // no se encolan más cada 15 s, porque trabarían todo lo demás del panel detrás de ellas.
  const refreshInFlightRef = useRef(false);

  const reloadLocalCheckIns = useCallback(async () => {
    try {
      setLocalCheckIns(await getTodayLocalCheckIns());
    } catch {
      // IndexedDB no disponible: solo se ven los ingresos ya subidos
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
      // Sin conexión: se mantienen los datos previos
    } finally {
      // La cola se lee después de la consulta al servidor: si el lote se subió en el medio, no se duplica.
      await reloadLocalCheckIns();
      refreshInFlightRef.current = false;
      setIsRefreshing(false);
    }
  }, [reloadLocalCheckIns]);

  useEffect(() => {
    const kickoffId = window.setTimeout(() => void reloadLocalCheckIns(), 0);
    const interval = window.setInterval(refreshAllData, 15000);
    const unsubscribe = gymBroadcast.subscribe((msg) => {
      if (msg.type === "CHECKIN_LOGGED" && msg.checkIn) {
        // El ingreso ya quedó en la cola local (IndexedDB compartida con la pantalla de Check-in).
        void reloadLocalCheckIns();
      } else if (msg.type === "REFRESH_DASHBOARD") {
        refreshAllData();
      } else if (msg.type === "SESSION_LOGOUT") {
        window.location.replace("/login");
      }
    });
    return () => {
      window.clearTimeout(kickoffId);
      window.clearInterval(interval);
      unsubscribe();
    };
  }, [refreshAllData, reloadLocalCheckIns]);

  const checkIns = [...localCheckIns, ...serverCheckIns].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const displayStats: DashboardStats = { ...stats, todayCheckIns: stats.todayCheckIns + localCheckIns.length };

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
        allowedDays: plans.find((p) => p.id === v.planId)?.allowedDaysPerWeek ?? null,
        validUntil: createdItem.validUntil,
        weeklyCheckIns: 0,
        lastCheckInAt: null,
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
          allowedDays: plans.find((p) => p.id === payload.planId)?.allowedDaysPerWeek ?? null,
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

  const q = searchQuery.trim();
  const match = (name: string, dni: string) => !q || matchesSearch(name, q) || dni.includes(q);
  const section = ADMIN_SECTIONS.find((s) => s.tab === activeTab) || ADMIN_SECTIONS[0];
  const SectionIcon = section.icon;

  return (
    <div data-theme={theme} className="min-h-screen bg-fx-base text-fx-text flex">
      <AdminSidebar
        activeTab={activeTab}
        onSelect={goToTab}
        counts={{ LIVE_FEED: checkIns.length, DEBTORS: debtors.length, ABSENT: absentMembers.length }}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
        mobileOpen={mobileMenuOpen}
        onOpenMobile={() => setMobileMenuOpen(true)}
        onCloseMobile={closeMobileMenu}
        onOpenNewMember={openNewMember}
      />

      <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          <HeaderStats
            stats={displayStats}
            onOpenNewMember={openNewMember}
            onRefresh={refreshAllData}
            isRefreshing={isRefreshing}
            theme={theme}
            onToggleTheme={toggleTheme}
            onGoToTab={goToTab}
            checkInScreenOnline={checkInScreenOnline}
            onOpenCheckInScreen={() => void dispatchScreens()}
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

          <div className="flex flex-col rounded-2xl bg-fx-surface border border-fx-border shadow-lg p-4 sm:p-6 gap-5 sm:gap-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 sm:pb-5 border-b border-fx-border">
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-xl bg-fx-orange/10 flex items-center justify-center shrink-0">
                  <SectionIcon className="w-6 h-6 text-fx-orange" />
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-fx-text">{section.label}</h2>
              </div>

              <div className={`relative w-full lg:w-80 ${activeTab === "METRICS" || activeTab === "PLANS" || activeTab === "SETTINGS" ? "hidden" : ""}`}>
                <Search className="w-5 h-5 text-fx-muted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre o DNI..."
                  className="w-full min-h-[52px] pl-12 pr-4 rounded-xl bg-fx-base border-2 border-fx-border focus:border-fx-orange focus:outline-none text-base text-fx-text"
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
            {activeTab === "METRICS" && (
              <>
                {/* Los gráficos no entran bien en el celular: ahí no se muestran. */}
                <div className="hidden lg:block">
                  <MetricsPanel stats={displayStats} onGoToTab={goToTab} />
                </div>
                <div className="lg:hidden p-8 text-center rounded-2xl bg-fx-base border border-fx-border">
                  <BarChart3 className="w-10 h-10 text-fx-muted mx-auto mb-3" />
                  <p className="text-lg font-bold text-fx-text">Las métricas se ven en la computadora</p>
                </div>
              </>
            )}
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
