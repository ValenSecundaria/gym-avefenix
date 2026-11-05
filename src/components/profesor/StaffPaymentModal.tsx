"use client";

import React, { useState } from "react";
import { AlertCircle, Check, CreditCard, Loader2, X } from "lucide-react";
import type { PaymentMethodType, PlanOption, StaffMemberItem } from "@/types";
import { groupPlansByDiscipline } from "@/components/admin/PlanPicker";

interface StaffPaymentModalProps {
  member: StaffMemberItem | null;
  plans: PlanOption[];
  /** Cuenta que queda registrada como autora del cobro. */
  registeredByName: string;
  onClose: () => void;
  onConfirm: (payload: { memberId: string; planId: string; method: PaymentMethodType; notes?: string }) => Promise<{
    success: boolean;
    error?: string;
  }>;
}

const INPUT_CLS =
  "w-full min-h-[48px] px-3.5 rounded-xl bg-fx-base border border-fx-border focus:border-fx-orange focus:outline-none text-sm text-fx-text";

function planDetail(p: PlanOption): string {
  if (p.category === "MENSUAL_DIAS") return `${p.allowedDaysPerWeek} días/semana`;
  if (p.category === "DIARIO") return "1 día";
  return "Libre";
}

// Cobro desde la cuenta de profesor: elige plan y medio de pago, sin ver montos (se cobra el precio del plan).
export function StaffPaymentModal({ member, plans, registeredByName, onClose, onConfirm }: StaffPaymentModalProps) {
  const [planId, setPlanId] = useState(member?.planId && plans.some((p) => p.id === member.planId) ? member.planId : plans[0]?.id ?? "");
  const [method, setMethod] = useState<PaymentMethodType>("EFECTIVO");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planId) return setError("Seleccioná un plan para registrar el cobro.");
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await onConfirm({ memberId: member.id, planId, method, notes: notes.trim() || undefined });
      if (!res.success) return setError(res.error || "No se pudo registrar el pago.");
      onClose();
    } catch {
      setError("Sin conexión: el pago no se registró.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="staff-payment-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-fx-surface border border-fx-border rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-fx-border bg-fx-base/60">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-fx-orange" />
            <h2 id="staff-payment-title" className="text-lg font-extrabold text-fx-text">Registrar pago</h2>
          </div>
          <button type="button" onClick={onClose} disabled={isSubmitting} aria-label="Cerrar" className="min-h-[48px] min-w-[48px] rounded-xl bg-fx-hover hover:bg-fx-border text-fx-muted hover:text-fx-text flex items-center justify-center cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div role="alert" className="flex items-center gap-2 p-3 rounded-xl bg-fx-red/20 border border-fx-red text-sm text-fx-text">
              <AlertCircle className="w-4 h-4 text-fx-red shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-fx-base border border-fx-border">
            <p className="text-xs font-bold uppercase text-fx-muted">Socio</p>
            <p className="text-base font-extrabold text-fx-text mt-0.5">{member.fullName}</p>
            <p className="text-xs font-mono text-fx-muted">DNI: {member.dni}</p>
          </div>

          <div>
            <label htmlFor="staff-payment-plan" className="block text-xs font-bold uppercase text-fx-muted mb-1.5">Plan</label>
            {plans.length === 0 ? (
              <p className="text-sm text-fx-muted">No hay planes a la venta. Pedile a la administración que cargue uno.</p>
            ) : (
              <select id="staff-payment-plan" value={planId} onChange={(e) => setPlanId(e.target.value)} className={INPUT_CLS}>
                {groupPlansByDiscipline(plans).map((g) => (
                  <optgroup key={g.key} label={g.label}>
                    {g.plans.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({planDetail(p)})</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            )}
          </div>

          <div>
            <span className="block text-xs font-bold uppercase text-fx-muted mb-1.5">Medio de pago</span>
            <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Medio de pago">
              {(["EFECTIVO", "TRANSFERENCIA"] as PaymentMethodType[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={method === m}
                  onClick={() => setMethod(m)}
                  className={`min-h-[48px] rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    method === m ? "bg-fx-orange/20 border-fx-orange text-fx-text" : "bg-fx-base border-fx-border text-fx-muted hover:text-fx-text"
                  }`}
                >
                  {m === "EFECTIVO" ? "Efectivo" : "Transferencia / QR"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="staff-payment-notes" className="block text-xs font-bold uppercase text-fx-muted mb-1.5">Notas (opcional)</label>
            <input id="staff-payment-notes" type="text" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} placeholder="Ej: Comprobante de transferencia..." className={INPUT_CLS} />
          </div>

          <p className="text-xs text-fx-muted">
            El pago queda registrado a nombre de <b className="text-fx-text">{registeredByName}</b>.
          </p>

          <div className="pt-4 border-t border-fx-border flex items-center justify-end gap-2.5">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="min-h-[48px] px-4 rounded-xl bg-fx-hover text-sm font-bold text-fx-muted hover:text-fx-text cursor-pointer">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting || plans.length === 0} className="min-h-[48px] px-5 rounded-xl bg-fx-orange hover:bg-fx-orange/90 text-sm font-extrabold text-white inline-flex items-center gap-2 shadow-lg shadow-fx-orange/25 disabled:opacity-50 cursor-pointer">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Confirmar pago</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
