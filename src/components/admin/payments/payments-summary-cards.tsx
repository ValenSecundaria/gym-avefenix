"use client";

import React from "react";
import { Banknote, Landmark, Wallet } from "lucide-react";

interface PaymentsSummaryCardsProps {
  totalAmount: number;
  totalEfectivo: { amount: number; count: number };
  totalTransferencia: { amount: number; count: number };
}

function formatMoney(value: number) {
  return `$ ${Math.round(value).toLocaleString("es-AR")}`;
}

export function PaymentsSummaryCards({
  totalAmount,
  totalEfectivo,
  totalTransferencia,
}: PaymentsSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-fx-surface border border-fx-border rounded-xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-fx-orange/15 border border-fx-orange/30 flex items-center justify-center shrink-0">
          <Wallet className="w-6 h-6 text-fx-orangeText" />
        </div>
        <div className="min-w-0">
          <p className="text-[15px] text-fx-muted font-medium">Total Recaudado</p>
          <p className="text-2xl font-bold text-fx-text truncate">{formatMoney(totalAmount)}</p>
        </div>
      </div>

      <div className="bg-fx-surface border border-fx-border rounded-xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center shrink-0">
          <Banknote className="w-6 h-6 text-[#10B981]" />
        </div>
        <div className="min-w-0">
          <p className="text-[15px] text-fx-muted font-medium">Cobros en Efectivo</p>
          <p className="text-2xl font-bold text-fx-text truncate">
            {formatMoney(totalEfectivo.amount)}
          </p>
          <p className="text-sm text-fx-muted">
            {totalEfectivo.count} {totalEfectivo.count === 1 ? "pago" : "pagos"}
          </p>
        </div>
      </div>

      <div className="bg-fx-surface border border-fx-border rounded-xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0">
          <Landmark className="w-6 h-6 text-sky-400" />
        </div>
        <div className="min-w-0">
          <p className="text-[15px] text-fx-muted font-medium">Cobros por Transferencia</p>
          <p className="text-2xl font-bold text-fx-text truncate">
            {formatMoney(totalTransferencia.amount)}
          </p>
          <p className="text-sm text-fx-muted">
            {totalTransferencia.count} {totalTransferencia.count === 1 ? "pago" : "pagos"}
          </p>
        </div>
      </div>
    </div>
  );
}
