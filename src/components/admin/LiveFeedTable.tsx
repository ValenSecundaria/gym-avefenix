"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, Clock, User } from "lucide-react";
import { MemberPhotoImg } from "@/components/ui/MemberPhotoImg";
import type { AccessStatusType, LiveCheckInItem } from "@/types";
import { formatTimeAR } from "@/lib/utils";
import { EditMemberButton } from "./EditMemberButton";
import { TemporarySyncPeriodButton } from "@/components/shared/temporary-sync-period-button";

interface LiveFeedTableProps {
  items: LiveCheckInItem[];
  onEditMember?: (memberId: string) => void;
  onSuccessSync?: (msg: string) => void;
  isHistorical?: boolean;
}

function StatusBadge({ status }: { status: AccessStatusType }) {
  if (status === "HABILITADO") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-extrabold uppercase tracking-wide bg-fx-green/15 text-fx-green border border-fx-green/40">
        <CheckCircle2 className="w-4 h-4" />
        <span>Habilitado</span>
      </span>
    );
  }
  if (status === "CUOTA_VENCIDA") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-extrabold uppercase tracking-wide bg-fx-red/20 text-fx-redText border border-fx-red/50">
        <AlertTriangle className="w-4 h-4" />
        <span>Cuota Vencida</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-extrabold uppercase tracking-wide bg-fx-amber/15 text-fx-amber border border-fx-amber/40">
      <Clock className="w-4 h-4" />
      <span>Límite Semanal</span>
    </span>
  );
}

export function LiveFeedTable({ items, onEditMember, onSuccessSync, isHistorical = false }: LiveFeedTableProps) {
  const [filter, setFilter] = useState<"ALL" | "DUE" | "LIMIT">("ALL");

  const dueCount = items.filter((i) => i.status === "CUOTA_VENCIDA").length;
  const limitCount = items.filter((i) => i.status === "LIMITE_ALCANZADO").length;
  const filteredItems = items.filter((i) =>
    filter === "DUE" ? i.status === "CUOTA_VENCIDA" : filter === "LIMIT" ? i.status === "LIMITE_ALCANZADO" : true
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por estado de acceso">
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className={`min-h-[48px] px-4 rounded-md text-xs sm:text-sm font-extrabold uppercase tracking-wide transition-colors cursor-pointer ${
            filter === "ALL" ? "bg-fx-orange text-[#0A0B0D]" : "bg-fx-base border border-fx-border text-fx-muted hover:text-fx-text"
          }`}
        >
          Todos ({items.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("DUE")}
          className={`min-h-[48px] px-4 rounded-md text-xs sm:text-sm font-extrabold uppercase tracking-wide inline-flex items-center gap-2 transition-colors cursor-pointer ${
            filter === "DUE" ? "bg-fx-red text-white" : "bg-fx-base border border-fx-border text-fx-muted hover:text-fx-text"
          }`}
        >
          <span>Cuota Vencida</span>
          <span className={`font-mono px-2 py-0.5 rounded-sm text-xs ${filter === "DUE" ? "bg-black/25 text-white" : "bg-fx-red/20 text-fx-redText"}`}>
            {dueCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setFilter("LIMIT")}
          className={`min-h-[48px] px-4 rounded-md text-xs sm:text-sm font-extrabold uppercase tracking-wide inline-flex items-center gap-2 transition-colors cursor-pointer ${
            filter === "LIMIT" ? "bg-fx-amber text-[#0A0B0D]" : "bg-fx-base border border-fx-border text-fx-muted hover:text-fx-text"
          }`}
        >
          <span>Límite Semanal</span>
          <span className={`font-mono px-2 py-0.5 rounded-sm text-xs ${filter === "LIMIT" ? "bg-black/20 text-[#0A0B0D]" : "bg-fx-amber/20 text-fx-amber"}`}>
            {limitCount}
          </span>
        </button>
      </div>

      {filteredItems.length === 0 ? (
        <div className="p-8 text-center text-[15px] text-fx-muted rounded-lg border border-dashed border-fx-border">
          {isHistorical
            ? "No se encontraron ingresos registrados en la fecha seleccionada."
            : "No hay ingresos en vivo registrados el día de hoy."}
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-3 md:hidden">
            {filteredItems.map((item) => (
              <li key={item.id} className="p-4 rounded-lg border border-fx-border bg-fx-base flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-md bg-fx-hover border border-fx-border overflow-hidden flex items-center justify-center shrink-0">
                    {item.photoUrl ? (
                      <MemberPhotoImg memberId={item.memberId} src={item.photoUrl} alt={item.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-fx-muted" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-base sm:text-lg text-fx-text leading-tight">{item.fullName}</div>
                    <div className="font-mono text-sm text-fx-muted">DNI {item.dni}</div>
                  </div>
                  <div className="font-mono font-black text-base text-fx-orangeText shrink-0">{formatTimeAR(item.createdAt)}</div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <StatusBadge status={item.status} />
                  {!isHistorical && (
                    <div className="flex items-center gap-2">
                      <TemporarySyncPeriodButton memberId={item.memberId} fullName={item.fullName} onSuccess={onSuccessSync} />
                      {onEditMember && <EditMemberButton fullName={item.fullName} onClick={() => onEditMember(item.memberId)} />}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden md:block overflow-x-auto rounded-lg border border-fx-border bg-fx-base">
            <table className="w-full text-left text-[15px] text-fx-text border-collapse">
              <thead>
                <tr className="bg-fx-surface text-fx-muted font-mono font-bold text-xs uppercase tracking-wider border-b border-fx-border">
                  <th className="py-3.5 px-4 whitespace-nowrap">Hora</th>
                  <th className="py-3.5 px-3 w-14 text-center">Foto</th>
                  <th className="py-3.5 px-4">Socio / Documento</th>
                  <th className="py-3.5 px-4">Plan Vigente</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">Estado Acceso</th>
                  {!isHistorical && (
                    <th className="py-3.5 px-4 text-right whitespace-nowrap"><span className="sr-only">Acciones</span></th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-fx-border">
                {filteredItems.map((item) => (
                  <tr key={item.id} className={`hover:bg-fx-hover transition-colors ${item.status === "CUOTA_VENCIDA" ? "bg-fx-red/5" : ""}`}>
                    <td className="py-3.5 px-4 font-mono font-extrabold text-fx-orangeText whitespace-nowrap align-middle">
                      {formatTimeAR(item.createdAt)} hs
                    </td>
                    <td className="py-3.5 px-3 align-middle">
                      <div className="w-11 h-11 rounded-md bg-fx-hover border border-fx-border overflow-hidden flex items-center justify-center shrink-0 mx-auto">
                        {item.photoUrl ? (
                          <MemberPhotoImg memberId={item.memberId} src={item.photoUrl} alt={item.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-fx-muted" />
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-middle">
                      <div className="font-bold text-base text-fx-text whitespace-nowrap">{item.fullName}</div>
                      <div className="font-mono text-xs text-fx-muted whitespace-nowrap">DNI: {item.dni}</div>
                    </td>
                    <td className="py-3.5 px-4 align-middle">
                      <span className="inline-block px-2.5 py-1 rounded-sm bg-fx-surface border border-fx-border text-xs font-bold text-fx-text whitespace-nowrap">
                        {item.planName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center align-middle whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>
                    {!isHistorical && (
                      <td className="py-3.5 px-4 text-right align-middle whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2 shrink-0">
                          <TemporarySyncPeriodButton memberId={item.memberId} fullName={item.fullName} onSuccess={onSuccessSync} />
                          {onEditMember && <EditMemberButton fullName={item.fullName} onClick={() => onEditMember(item.memberId)} />}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
