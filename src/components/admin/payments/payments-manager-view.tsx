"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import {
  getPaymentsHistoryAction,
  type PaymentHistoryItem,
  type PaymentsHistoryResult,
} from "@/actions/payments-module.actions";
import type { PlanOption } from "@/types";
import { PaymentsSummaryCards } from "./payments-summary-cards";

type DatePreset = "THIS_MONTH" | "LAST_MONTH" | "ALL";

function getDateRange(preset: DatePreset): { startDate?: string; endDate?: string } {
  if (preset === "ALL") return {};
  const now = new Date();
  if (preset === "THIS_MONTH") return { startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString() };
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function PaymentsManagerView({ plans }: { plans: PlanOption[] }) {
  const [search, setSearch] = useState("");
  const [planId, setPlanId] = useState("ALL");
  const [datePreset, setDatePreset] = useState<DatePreset>("THIS_MONTH");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaymentsHistoryResult>({
    payments: [],
    total: 0,
    page: 1,
    pageSize: 50,
    totalPages: 1,
    totals: { totalAmount: 0, totalEfectivo: { amount: 0, count: 0 }, totalTransferencia: { amount: 0, count: 0 } },
  });
  const [loading, setLoading] = useState(true);

  const loadPayments = useCallback(async (targetPage: number) => {
    setLoading(true);
    const range = getDateRange(datePreset);
    const res = await getPaymentsHistoryAction({ planId, search, page: targetPage, ...range });
    if (res.success) {
      setData(res.data);
      if (res.data.page !== targetPage) setPage(res.data.page);
    }
    setLoading(false);
  }, [planId, search, datePreset]);

  useEffect(() => { setPage(1); }, [search, planId, datePreset]);

  useEffect(() => {
    const t = setTimeout(() => loadPayments(page), 180);
    return () => clearTimeout(t);
  }, [loadPayments, page]);

  const clearFilters = () => { setSearch(""); setPlanId("ALL"); setDatePreset("ALL"); setPage(1); };
  const from = data.total > 0 ? (data.page - 1) * data.pageSize + 1 : 0;
  const to = Math.min(data.page * data.pageSize, data.total);

  return (
    <div className="space-y-5 text-fx-text">
      <p className="text-[15px] text-fx-muted">
        Consultá y filtrá el historial de cobros realizados por plan, socio o fecha.
      </p>

      <PaymentsSummaryCards {...data.totals} />

      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-fx-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar socio por nombre o DNI..."
            className="w-full min-h-[48px] pl-11 pr-4 bg-fx-surface border border-fx-border rounded-xl text-[15px] placeholder:text-fx-muted"
          />
        </div>
        <select value={planId} onChange={(e) => setPlanId(e.target.value)} className="min-h-[48px] px-3.5 bg-fx-surface border border-fx-border rounded-xl text-[15px]">
          <option value="ALL">Todos los planes</option>
          {plans.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
        </select>
        <div className="flex flex-wrap gap-2">
          {([["THIS_MONTH", "Este mes"], ["LAST_MONTH", "Mes pasado"], ["ALL", "Todo el historial"]] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setDatePreset(key)}
              className={`min-h-[48px] px-4 rounded-xl border text-[15px] font-medium whitespace-nowrap transition ${
                datePreset === key ? "bg-fx-orange border-fx-orange text-white" : "bg-fx-surface border-fx-border text-fx-muted hover:text-fx-text"
              }`}
            >{label}</button>
          ))}
        </div>
      </div>

      <div className="bg-fx-surface border border-fx-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[15px] text-fx-muted">Cargando pagos...</div>
        ) : data.payments.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-[16px] text-fx-muted">No se encontraron pagos con esos filtros</p>
            <button type="button" onClick={clearFilters} className="min-h-[48px] px-5 rounded-xl border border-fx-border text-[15px] font-semibold hover:bg-fx-base">Limpiar filtros</button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[15px]">
                <thead className="border-b border-fx-border text-fx-muted text-sm">
                  <tr>
                    <th className="py-3.5 px-4">Fecha</th>
                    <th className="py-3.5 px-4">Socio</th>
                    <th className="py-3.5 px-4">Plan</th>
                    <th className="py-3.5 px-4">Monto</th>
                    <th className="py-3.5 px-4">Forma de pago</th>
                    <th className="py-3.5 px-4">Cubierto hasta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fx-border">
                  {data.payments.map((p: PaymentHistoryItem) => (
                    <tr key={p.id} className="hover:bg-fx-base/50">
                      <td className="py-3.5 px-4 whitespace-nowrap">{formatDate(p.paidAt)}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-fx-border flex items-center justify-center font-bold text-sm shrink-0">{p.member.fullName.charAt(0).toUpperCase()}</div>
                          <div><p className="font-semibold">{p.member.fullName}</p><p className="text-xs text-fx-muted">DNI {p.member.dni}</p></div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-lg bg-fx-base border border-fx-border text-sm">{p.plan?.name ?? "Sin plan"}</span></td>
                      <td className="py-3.5 px-4 font-bold whitespace-nowrap">$ {Math.round(p.amount).toLocaleString("es-AR")}</td>
                      <td className="py-3.5 px-4"><span className={p.method === "EFECTIVO" ? "text-[#10B981] font-medium" : "text-sky-400 font-medium"}>{p.method === "EFECTIVO" ? "Efectivo" : "Transferencia"}</span></td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-fx-muted">{formatDate(p.validUntil)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-fx-border text-[14px] text-fx-muted">
              <div>Mostrando <b className="text-fx-text">{from}</b> a <b className="text-fx-text">{to}</b> de <b className="text-fx-text">{data.total}</b> pagos</div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading} className="min-h-[40px] px-3.5 rounded-lg border border-fx-border text-fx-text flex items-center gap-1.5 font-medium hover:bg-fx-base disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>
                <span className="px-2 text-[14px]">Página <b className="text-fx-text">{data.page}</b> de <b className="text-fx-text">{data.totalPages}</b></span>
                <button type="button" onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page >= data.totalPages || loading} className="min-h-[40px] px-3.5 rounded-lg border border-fx-border text-fx-text flex items-center gap-1.5 font-medium hover:bg-fx-base disabled:opacity-40 disabled:cursor-not-allowed">
                  Siguiente <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
