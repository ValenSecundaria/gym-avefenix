"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, MessageCircle, User, UserPen, Users } from "lucide-react";
import type { MemberRowItem, MembersPage, MemberStatusFilter } from "@/types";
import { formatDateAR } from "@/lib/utils";
import { getMembersPage } from "@/actions/members.actions";
import { WhatsAppEditModal, type WhatsAppMessageTarget } from "./WhatsAppEditModal";

interface MembersSectionProps {
  searchQuery: string;
  /** Cambia cada vez que se edita un socio, para volver a pedir la página. */
  reloadKey: number;
  onEditMember: (memberId: string) => void;
}

const STATUS_BADGE: Record<MemberRowItem["membershipStatus"], { text: string; cls: string }> = {
  ACTIVA: { text: "Al día", cls: "bg-fx-green/15 text-fx-green border-fx-green/40" },
  VENCIDA: { text: "Vencida", cls: "bg-fx-red/15 text-fx-red border-fx-red/40" },
  CANCELADA: { text: "Cancelada", cls: "bg-fx-red/15 text-fx-red border-fx-red/40" },
  SIN_MEMBRESIA: { text: "Sin plan", cls: "bg-fx-hover text-fx-muted border-fx-border" },
};

const STATUS_FILTERS: { value: MemberStatusFilter; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "ACTIVA", label: "Al día" },
  { value: "VENCIDA", label: "Vencidos" },
  { value: "SIN_MEMBRESIA", label: "Sin plan" },
];

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function lastVisitLabel(iso: string | null, now: number): string {
  if (!iso) return "Sin ingresos";
  const days = Math.floor((now - new Date(iso).getTime()) / MS_PER_DAY);
  if (days <= 0) return "Vino hoy";
  if (days === 1) return "Vino ayer";
  return `Vino hace ${days} días`;
}

function whatsAppMessage(m: MemberRowItem): string {
  if (m.membershipStatus === "VENCIDA" && m.validUntil) {
    return `¡Hola ${m.fullName}! Te escribimos de Gimnasio Ave Fénix para recordarte que tu cuota del plan ${m.planName} venció el ${formatDateAR(m.validUntil)}. ¡Te esperamos en recepción para renovarla!`;
  }
  return `¡Hola ${m.fullName}! Te escribimos de Gimnasio Ave Fénix.`;
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-[40px] px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
        active ? "bg-fx-orange text-white" : "bg-fx-surface border border-fx-border text-fx-muted hover:text-fx-text"
      }`}
    >
      {children}
    </button>
  );
}

export function MembersSection({ searchQuery, reloadKey, onEditMember }: MembersSectionProps) {
  const [waTarget, setWaTarget] = useState<WhatsAppMessageTarget | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [statusFilter, setStatusFilter] = useState<MemberStatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<MembersPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Referencia para "vino hace N días": se toma al recibir cada página, no durante el render.
  const [loadedAt, setLoadedAt] = useState(0);

  // Al cambiar búsqueda o filtros se vuelve a la primera página.
  const [lastFilters, setLastFilters] = useState({ searchQuery, showInactive, statusFilter });
  if (
    lastFilters.searchQuery !== searchQuery ||
    lastFilters.showInactive !== showInactive ||
    lastFilters.statusFilter !== statusFilter
  ) {
    setLastFilters({ searchQuery, showInactive, statusFilter });
    setPage(1);
  }

  useEffect(() => {
    let cancelled = false;
    // Espera a que se deje de tipear antes de consultar la base.
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await getMembersPage({
          search: searchQuery.trim() || undefined,
          inactive: showInactive,
          status: statusFilter,
          page,
        });
        if (cancelled) return;
        if (res.success && res.data) {
          setData(res.data);
          setLoadedAt(Date.now());
          setError(null);
          if (res.data.page !== page) setPage(res.data.page);
        } else {
          setError(res.error || "No se pudo cargar el listado de clientes.");
        }
      } catch {
        if (!cancelled) setError("Sin conexión: no se pudo cargar el listado de clientes.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchQuery, showInactive, statusFilter, page, reloadKey]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const from = data && data.total > 0 ? (data.page - 1) * data.pageSize + 1 : 0;
  const to = data ? Math.min(data.page * data.pageSize, data.total) : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 p-4 rounded-xl bg-fx-base border border-fx-border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Estado de la cuota">
            {STATUS_FILTERS.map((f) => (
              <FilterButton key={f.value} active={statusFilter === f.value} onClick={() => setStatusFilter(f.value)}>
                {f.label}
              </FilterButton>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Clientes activos o dados de baja">
            <FilterButton active={!showInactive} onClick={() => setShowInactive(false)}>Activos</FilterButton>
            <FilterButton active={showInactive} onClick={() => setShowInactive(true)}>Dados de baja</FilterButton>
          </div>
        </div>
        <div className="text-xs text-fx-muted inline-flex items-center gap-2 min-h-[20px]" aria-live="polite">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-fx-orange" />}
          {data && (data.total === 0 ? "Sin resultados" : `Mostrando ${from}–${to} de ${data.total} clientes`)}
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 p-3 rounded-xl bg-fx-red/20 border border-fx-red text-sm text-fx-text">
          <AlertCircle className="w-4 h-4 text-fx-red shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {data && data.total === 0 && !isLoading ? (
        <div className="bg-fx-surface border border-fx-border rounded-2xl p-10 text-center">
          <Users className="w-10 h-10 text-fx-muted mx-auto mb-3" />
          <h3 className="text-lg font-bold text-fx-text">
            {searchQuery.trim() || statusFilter !== "ALL" ? "Ningún cliente coincide con los filtros" : showInactive ? "No hay clientes dados de baja" : "Todavía no hay clientes"}
          </h3>
        </div>
      ) : (
        <div className={`flex flex-col gap-2 transition-opacity ${isLoading ? "opacity-60" : ""}`}>
          {(data?.items ?? []).map((m) => {
            const badge = STATUS_BADGE[m.membershipStatus];
            return (
              <div
                key={m.id}
                className="p-3 sm:p-4 rounded-xl bg-fx-base border border-fx-border hover:border-fx-orange/60 flex flex-wrap items-center justify-between gap-3 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => onEditMember(m.id)}
                  className="flex-1 min-w-0 text-left flex items-center gap-3 sm:gap-4 cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-full bg-fx-hover border border-fx-border overflow-hidden flex items-center justify-center shrink-0">
                    {m.photoUrl ? <img src={m.photoUrl} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-fx-muted" />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-base text-fx-text">{m.fullName}</div>
                    <div className="font-mono text-xs text-fx-muted mt-0.5 flex flex-wrap items-center gap-x-2">
                      <span>DNI: {m.dni}</span>
                      <span>•</span>
                      <span>{m.planName}</span>
                      {m.validUntil && (
                        <>
                          <span>•</span>
                          <span>Vence: {formatDateAR(m.validUntil)}</span>
                        </>
                      )}
                      {m.phone && (
                        <>
                          <span>•</span>
                          <span>Tel: {m.phone}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{lastVisitLabel(m.lastCheckInAt, loadedAt)}</span>
                    </div>
                  </div>
                </button>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${badge.cls}`}>{badge.text}</span>
                  {m.phone && (
                    <button
                      type="button"
                      onClick={() =>
                        setWaTarget({
                          fullName: m.fullName,
                          phone: m.phone!,
                          defaultMessage: whatsAppMessage(m),
                        })
                      }
                      aria-label={`Contactar por WhatsApp a ${m.fullName}`}
                      className="min-h-[40px] px-3 rounded-xl bg-[#25D366] hover:bg-[#25D366]/90 text-fx-base text-sm font-extrabold inline-flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onEditMember(m.id)}
                    className="min-h-[40px] px-3 rounded-xl bg-fx-surface border border-fx-border hover:border-fx-orange text-fx-text text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
                  >
                    <UserPen className="w-4 h-4 text-fx-orange" />
                    <span>Ver / editar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <WhatsAppEditModal target={waTarget} onClose={() => setWaTarget(null)} />

      {data && totalPages > 1 && (
        <nav aria-label="Páginas de clientes" className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isLoading}
            className="min-h-[44px] px-4 rounded-xl bg-fx-base border border-fx-border text-sm font-bold text-fx-text inline-flex items-center gap-1.5 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          <span className="text-sm text-fx-muted">
            Página <b className="text-fx-text">{data.page}</b> de {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isLoading}
            className="min-h-[44px] px-4 rounded-xl bg-fx-base border border-fx-border text-sm font-bold text-fx-text inline-flex items-center gap-1.5 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
