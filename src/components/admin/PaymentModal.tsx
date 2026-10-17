"use client";

import React, { useState } from "react";
import { X, CreditCard, Check, Loader2, AlertCircle } from "lucide-react";
import type { DebtorMemberItem, PaymentMethodType, PlanOption } from "@/types";
import { formatCurrencyARS } from "@/lib/utils";

interface PaymentModalProps {
  debtor: DebtorMemberItem | null;
  plans: PlanOption[];
  onClose: () => void;
  onConfirmPayment: (payload: {
    memberId: string;
    planId: string;
    amount: number;
    method: PaymentMethodType;
    notes?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

const INPUT_CLS =
  "w-full min-h-[48px] px-3.5 rounded-xl bg-[#0B0B0C] border border-[#2C2D35] focus:border-[#F95716] focus:outline-none text-sm text-[#F4F5F7]";

export function PaymentModal({ debtor, plans, onClose, onConfirmPayment }: PaymentModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState(debtor?.planId || plans[0]?.id || "");
  const [method, setMethod] = useState<PaymentMethodType>("EFECTIVO");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!debtor) return null;

  const activePlan = plans.find((p) => p.id === (selectedPlanId || debtor.planId)) || plans[0];
  const amount = activePlan ? activePlan.price : debtor.planPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlan) return setError("Seleccioná un plan válido para registrar el cobro.");
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await onConfirmPayment({
        memberId: debtor.id,
        planId: activePlan.id,
        amount,
        method,
        notes: notes.trim() || undefined,
      });
      if (!res.success) return setError(res.error || "No se pudo registrar el pago.");
      onClose();
    } catch {
      setError("Error inesperado al procesar el cobro.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#17171C] border border-[#2C2D35] rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2C2D35] bg-[#0B0B0C]/60">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-[#F95716]" />
            <h2 className="text-lg font-extrabold text-[#F4F5F7]">Registrar Cobro de Cuota</h2>
          </div>
          <button type="button" onClick={onClose} disabled={isSubmitting} className="min-h-[48px] min-w-[48px] rounded-xl bg-[#23232A] hover:bg-[#2C2D35] text-[#8A909A] hover:text-[#F4F5F7] flex items-center justify-center cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#D92614]/20 border border-[#D92614] text-sm text-[#F4F5F7]">
              <AlertCircle className="w-4 h-4 text-[#D92614] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-[#0B0B0C] border border-[#2C2D35]">
            <p className="text-xs font-bold uppercase text-[#8A909A]">Socio</p>
            <p className="text-base font-extrabold text-[#F4F5F7] mt-0.5">{debtor.fullName}</p>
            <p className="text-xs font-mono text-[#8A909A]">DNI: {debtor.dni}</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#8A909A] mb-1.5">Plan a Renovar</label>
            <select value={activePlan?.id || ""} onChange={(e) => setSelectedPlanId(e.target.value)} className={INPUT_CLS}>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — {formatCurrencyARS(p.price)} ({p.durationDays} días)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#8A909A] mb-1.5">Método de Pago</label>
            <div className="grid grid-cols-2 gap-2.5">
              {(["EFECTIVO", "TRANSFERENCIA"] as PaymentMethodType[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`min-h-[48px] rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    method === m ? "bg-[#F95716]/20 border-[#F95716] text-[#F4F5F7]" : "bg-[#0B0B0C] border-[#2C2D35] text-[#8A909A] hover:text-[#F4F5F7]"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#8A909A] mb-1.5">Notas (Opcional)</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej: Comprobante transferencia..." className={INPUT_CLS} />
          </div>

          <div className="pt-4 border-t border-[#2C2D35] flex items-center justify-between">
            <div>
              <span className="text-xs text-[#8A909A] block">Total a cobrar</span>
              <span className="text-2xl font-extrabold text-[#10B981]">{formatCurrencyARS(amount)}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <button type="button" onClick={onClose} disabled={isSubmitting} className="min-h-[48px] px-4 rounded-xl bg-[#23232A] text-sm font-bold text-[#8A909A] hover:text-[#F4F5F7] cursor-pointer">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting} className="min-h-[48px] px-5 rounded-xl bg-[#F95716] hover:bg-[#F95716]/90 text-sm font-extrabold text-[#F4F5F7] inline-flex items-center gap-2 shadow-lg shadow-[#F95716]/25 disabled:opacity-50 cursor-pointer">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Confirmar Cobro</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
