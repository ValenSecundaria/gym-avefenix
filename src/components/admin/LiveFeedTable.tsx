"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, Clock, User } from "lucide-react";
import type { AccessStatusType, LiveCheckInItem } from "@/types";
import { formatTimeAR } from "@/lib/utils";

interface LiveFeedTableProps {
  items: LiveCheckInItem[];
}

function StatusBadge({ status }: { status: AccessStatusType }) {
  if (status === "HABILITADO") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/40">
        <CheckCircle2 className="w-4 h-4" />
        <span>Al día / Molinete Abierto</span>
      </span>
    );
  }
  if (status === "CUOTA_VENCIDA") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#D92614]/20 text-[#D92614] border border-[#D92614]/50">
        <AlertTriangle className="w-4 h-4" />
        <span>⚠ Cuota Vencida</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FFB300]/15 text-[#FFB300] border border-[#FFB300]/40">
      <Clock className="w-4 h-4" />
      <span>Límite Semanal Alcanzado</span>
    </span>
  );
}

export function LiveFeedTable({ items }: LiveFeedTableProps) {
  const [filter, setFilter] = useState<"ALL" | "DUE" | "LIMIT">("ALL");

  const dueCount = items.filter((i) => i.status === "CUOTA_VENCIDA").length;
  const limitCount = items.filter((i) => i.status === "LIMITE_ALCANZADO").length;
  const filteredItems = items.filter((i) =>
    filter === "DUE" ? i.status === "CUOTA_VENCIDA" : filter === "LIMIT" ? i.status === "LIMITE_ALCANZADO" : true
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#0B0B0C] border border-[#2C2D35]">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setFilter("ALL")} className={`min-h-[40px] px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer ${filter === "ALL" ? "bg-[#F95716] text-[#F4F5F7]" : "bg-[#17171C] border border-[#2C2D35] text-[#8A909A] hover:text-[#F4F5F7]"}`}>
            Todos los ingresos ({items.length})
          </button>
          <button type="button" onClick={() => setFilter("DUE")} className={`min-h-[40px] px-4 rounded-lg text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer ${filter === "DUE" ? "bg-[#D92614] text-[#F4F5F7]" : "bg-[#17171C] border border-[#2C2D35] text-[#8A909A] hover:text-[#F4F5F7]"}`}>
            <span className="w-2 h-2 rounded-full bg-[#D92614]" />
            <span>Con alerta de cuota ({dueCount})</span>
          </button>
          <button type="button" onClick={() => setFilter("LIMIT")} className={`min-h-[40px] px-4 rounded-lg text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer ${filter === "LIMIT" ? "bg-[#FFB300] text-[#0B0B0C]" : "bg-[#17171C] border border-[#2C2D35] text-[#8A909A] hover:text-[#F4F5F7]"}`}>
            <span className="w-2 h-2 rounded-full bg-[#FFB300]" />
            <span>Límite semanal alcanzado ({limitCount})</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[#10B981] text-xs font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
          <span>Transmisión en vivo molinete Ave Fénix</span>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-[#17171C] border border-[#2C2D35] rounded-2xl p-10 text-center">
          <Clock className="w-10 h-10 text-[#8A909A] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#F4F5F7]">Sin ingresos para este filtro</h3>
          <p className="text-sm text-[#8A909A] mt-1">
            A medida que los socios ingresen su DNI en la terminal, aparecerán aquí en tiempo real.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#2C2D35] bg-[#17171C]">
          <table className="w-full text-left text-sm text-[#F4F5F7] border-collapse">
            <thead>
              <tr className="bg-[#0B0B0C] text-[#8A909A] font-bold text-xs uppercase tracking-wider border-b border-[#2C2D35]">
                <th className="py-4 px-5">Hora</th>
                <th className="py-4 px-4">Foto</th>
                <th className="py-4 px-5">Socio / Documento</th>
                <th className="py-4 px-5">Plan Contratado</th>
                <th className="py-4 px-5 text-right">Estado Acceso / Cuota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C2D35]">
              {filteredItems.map((item) => (
                <tr key={item.id} className={`hover:bg-[#23232A] transition-colors ${item.status === "CUOTA_VENCIDA" ? "bg-[#D92614]/5" : ""}`}>
                  <td className="py-4 px-5 font-mono font-bold text-[#F95716]">{formatTimeAR(item.createdAt)} hs</td>
                  <td className="py-4 px-4">
                    <div className="w-11 h-11 rounded-full bg-[#23232A] border border-[#2C2D35] overflow-hidden flex items-center justify-center">
                      {item.photoUrl ? (
                        <img src={item.photoUrl} alt={item.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-[#8A909A]" />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="font-bold text-base text-[#F4F5F7]">{item.fullName}</div>
                    <div className="font-mono text-xs text-[#8A909A]">DNI: {item.dni}</div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="px-3 py-1.5 rounded-lg bg-[#0B0B0C] border border-[#2C2D35] text-xs font-semibold text-[#F4F5F7]">
                      {item.planName}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
