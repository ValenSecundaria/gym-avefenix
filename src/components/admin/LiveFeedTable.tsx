"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, Clock, User } from "lucide-react";
import type { AccessStatusType, LiveCheckInItem } from "@/types";
import { formatTimeAR } from "@/lib/utils";
import { EditMemberButton } from "./EditMemberButton";

interface LiveFeedTableProps {
  items: LiveCheckInItem[];
  onEditMember: (memberId: string) => void;
}

function StatusBadge({ status }: { status: AccessStatusType }) {
  if (status === "HABILITADO") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-fx-green/15 text-fx-green border border-fx-green/40">
        <CheckCircle2 className="w-4 h-4" />
        <span>Al día / Molinete Abierto</span>
      </span>
    );
  }
  if (status === "CUOTA_VENCIDA") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-fx-red/20 text-fx-red border border-fx-red/50">
        <AlertTriangle className="w-4 h-4" />
        <span>⚠ Cuota Vencida</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-fx-amber/15 text-fx-amber border border-fx-amber/40">
      <Clock className="w-4 h-4" />
      <span>Límite de Ingresos Alcanzado</span>
    </span>
  );
}

export function LiveFeedTable({ items, onEditMember }: LiveFeedTableProps) {
  const [filter, setFilter] = useState<"ALL" | "DUE" | "LIMIT">("ALL");

  const dueCount = items.filter((i) => i.status === "CUOTA_VENCIDA").length;
  const limitCount = items.filter((i) => i.status === "LIMITE_ALCANZADO").length;
  const filteredItems = items.filter((i) =>
    filter === "DUE" ? i.status === "CUOTA_VENCIDA" : filter === "LIMIT" ? i.status === "LIMITE_ALCANZADO" : true
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-fx-base border border-fx-border">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setFilter("ALL")} className={`min-h-[40px] px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer ${filter === "ALL" ? "bg-fx-orange text-white" : "bg-fx-surface border border-fx-border text-fx-muted hover:text-fx-text"}`}>
            Todos los ingresos ({items.length})
          </button>
          <button type="button" onClick={() => setFilter("DUE")} className={`min-h-[40px] px-4 rounded-lg text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer ${filter === "DUE" ? "bg-fx-red text-white" : "bg-fx-surface border border-fx-border text-fx-muted hover:text-fx-text"}`}>
            <span className="w-2 h-2 rounded-full bg-fx-red" />
            <span>Con alerta de cuota ({dueCount})</span>
          </button>
          <button type="button" onClick={() => setFilter("LIMIT")} className={`min-h-[40px] px-4 rounded-lg text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer ${filter === "LIMIT" ? "bg-fx-amber text-fx-base" : "bg-fx-surface border border-fx-border text-fx-muted hover:text-fx-text"}`}>
            <span className="w-2 h-2 rounded-full bg-fx-amber" />
            <span>Límite de ingresos alcanzado ({limitCount})</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-fx-green text-sm font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-fx-green animate-pulse" />
          <span>En vivo</span>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-fx-surface border border-fx-border rounded-2xl p-10 text-center">
          <Clock className="w-10 h-10 text-fx-muted mx-auto mb-3" />
          <h3 className="text-lg font-bold text-fx-text">Sin ingresos para este filtro</h3>
          <p className="text-sm text-fx-muted mt-1">
            A medida que los socios ingresen su DNI en la terminal, aparecerán aquí en tiempo real.
          </p>
        </div>
      ) : (
        <>
        {/* Celular: una tarjeta por ingreso */}
        <ul className="md:hidden flex flex-col gap-3">
          {filteredItems.map((item) => (
            <li
              key={item.id}
              className={`p-4 rounded-2xl border bg-fx-base flex flex-col gap-3 ${
                item.status === "CUOTA_VENCIDA" ? "border-fx-red/50" : "border-fx-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-fx-hover border border-fx-border overflow-hidden flex items-center justify-center shrink-0">
                  {item.photoUrl ? (
                    <img src={item.photoUrl} alt={item.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-fx-muted" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-lg text-fx-text leading-tight">{item.fullName}</div>
                  <div className="font-mono text-sm text-fx-muted">DNI {item.dni}</div>
                </div>
                <div className="font-mono font-extrabold text-lg text-fx-orange shrink-0">{formatTimeAR(item.createdAt)}</div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <StatusBadge status={item.status} />
                <EditMemberButton fullName={item.fullName} onClick={() => onEditMember(item.memberId)} />
              </div>
            </li>
          ))}
        </ul>

        <div className="hidden md:block overflow-x-auto rounded-xl border border-fx-border bg-fx-surface">
          <table className="w-full text-left text-sm text-fx-text border-collapse">
            <thead>
              <tr className="bg-fx-base text-fx-muted font-bold text-xs uppercase tracking-wider border-b border-fx-border">
                <th className="py-4 px-5">Hora</th>
                <th className="py-4 px-4">Foto</th>
                <th className="py-4 px-5">Socio / Documento</th>
                <th className="py-4 px-5">Plan Contratado</th>
                <th className="py-4 px-5 text-right">Estado Acceso / Cuota</th>
                <th className="py-4 px-4"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fx-border">
              {filteredItems.map((item) => (
                <tr key={item.id} className={`hover:bg-fx-hover transition-colors ${item.status === "CUOTA_VENCIDA" ? "bg-fx-red/5" : ""}`}>
                  <td className="py-4 px-5 font-mono font-bold text-fx-orange">{formatTimeAR(item.createdAt)} hs</td>
                  <td className="py-4 px-4">
                    <div className="w-11 h-11 rounded-full bg-fx-hover border border-fx-border overflow-hidden flex items-center justify-center">
                      {item.photoUrl ? (
                        <img src={item.photoUrl} alt={item.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-fx-muted" />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="font-bold text-base text-fx-text">{item.fullName}</div>
                    <div className="font-mono text-xs text-fx-muted">DNI: {item.dni}</div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="px-3 py-1.5 rounded-lg bg-fx-base border border-fx-border text-xs font-semibold text-fx-text">
                      {item.planName}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <EditMemberButton fullName={item.fullName} onClick={() => onEditMember(item.memberId)} />
                  </td>
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
