"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, Clock, User, Activity } from "lucide-react";
import { MemberPhotoImg } from "@/components/ui/MemberPhotoImg";
import { TemporarySyncPeriodButton } from "@/components/shared/temporary-sync-period-button";
import type { AccessStatusType, LiveCheckInItem } from "@/types";
import { formatTimeAR } from "@/lib/utils";

// TODO [TEMPORARY-TRANSITION]: Eliminar este botón al finalizar el primer mes
interface Props {
  items: LiveCheckInItem[];
  isLoading?: boolean;
  onSuccessSync?: (msg: string) => void;
}

function StatusBadge({ status }: { status: AccessStatusType }) {
  if (status === "HABILITADO") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-fx-green/15 text-fx-green border border-fx-green/40">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Habilitado</span>
      </span>
    );
  }
  if (status === "CUOTA_VENCIDA") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-fx-red/20 text-fx-red border border-fx-red/50">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>Vencido</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-fx-amber/15 text-fx-amber border border-fx-amber/40">
      <Clock className="w-3.5 h-3.5" />
      <span>Límite</span>
    </span>
  );
}

export function TeacherLiveFeedTable({ items, isLoading = false, onSuccessSync }: Props) {
  const [filter, setFilter] = useState<"ALL" | "DUE" | "LIMIT">("ALL");

  const filtered = items.filter((i) =>
    filter === "DUE" ? i.status === "CUOTA_VENCIDA" : filter === "LIMIT" ? i.status === "LIMITE_ALCANZADO" : true
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por estado">
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className={`min-h-[40px] px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            filter === "ALL" ? "bg-fx-orange text-white" : "bg-fx-surface border border-fx-border text-fx-muted hover:text-fx-text"
          }`}
        >
          Todos ({items.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("DUE")}
          className={`min-h-[40px] px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            filter === "DUE" ? "bg-fx-red text-white" : "bg-fx-surface border border-fx-border text-fx-muted hover:text-fx-text"
          }`}
        >
          Cuota vencida ({items.filter((i) => i.status === "CUOTA_VENCIDA").length})
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="p-8 text-center text-sm text-fx-muted rounded-xl border border-dashed border-fx-border">
          {isLoading ? "Cargando ingresos..." : "No hay ingresos registrados en esta sección hoy."}
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-fx-border rounded-xl border border-fx-border bg-fx-base">
          {filtered.map((item) => (
            <li key={item.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-fx-surface border border-fx-border overflow-hidden flex items-center justify-center shrink-0">
                  {item.photoUrl ? (
                    <MemberPhotoImg memberId={item.memberId} src={item.photoUrl} alt={item.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-fx-muted" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm sm:text-base text-fx-text truncate">{item.fullName}</div>
                  <div className="text-xs font-mono text-fx-muted">DNI {item.dni} · {item.planName}</div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2.5">
                <span className="font-mono text-xs text-fx-orange font-bold shrink-0">{formatTimeAR(item.createdAt)}</span>
                <StatusBadge status={item.status} />
                <TemporarySyncPeriodButton
                  memberId={item.memberId}
                  fullName={item.fullName}
                  onSuccess={onSuccessSync}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
