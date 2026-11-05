"use client";

import React from "react";
import { AlertCircle, ChevronLeft, ChevronRight, CreditCard, Loader2 } from "lucide-react";
import type { StaffMemberItem, StaffMembersPage, StaffMemberStatus } from "@/types";

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

interface Props {
  data: StaffMembersPage | null;
  statusFilter: StatusFilter;
  onChangeFilter: (f: StatusFilter) => void;
  isLoading: boolean;
  listError: string | null;
  onGoToPage: (page: number) => void;
  onPayMember: (m: StaffMemberItem) => void;
  canCreateMember: boolean;
}

export function StaffClientsTable({
  data,
  statusFilter,
  onChangeFilter,
  isLoading,
  listError,
  onGoToPage,
  onPayMember,
  canCreateMember,
}: Props) {
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por estado">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => onChangeFilter(f.value)}
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
                      onClick={() => onPayMember(m)}
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
          <button type="button" onClick={() => onGoToPage(data.page - 1)} disabled={data.page <= 1 || isLoading} className={ICON_BTN}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-fx-muted">Página {data.page} de {totalPages}</span>
          <button type="button" onClick={() => onGoToPage(data.page + 1)} disabled={data.page >= totalPages || isLoading} className={ICON_BTN}>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
