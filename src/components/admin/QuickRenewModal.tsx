"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, Check, Loader2, RefreshCw, X } from "lucide-react";
import type { CachedMember, PaymentMethodType, PlanOption } from "@/types";
import { formatCurrencyARS, formatDateAR } from "@/lib/utils";
import { computeQuickRenewal, QUICK_RENEWAL_DAYS } from "@/lib/membership-renewal";
import { quickRenewMembership, type QuickRenewalResult } from "@/actions/payments.actions";
import { saveMembersToCache } from "@/lib/db/indexed-db";
import { gymBroadcast } from "@/lib/screens/broadcast-channel";
import { groupPlansByDiscipline } from "./PlanPicker";

export interface QuickRenewTarget {
  id: string;
  dni: string;
  fullName: string;
  planId: string | null;
  planName: string;
  validUntil: string | null;
}

interface QuickRenewModalProps {
  target: QuickRenewTarget | null;
  plans: PlanOption[];
  onClose: () => void;
  onRenewed: (result: QuickRenewalResult, target: QuickRenewTarget) => void;
}

const INPUT_CLS =
  "w-full min-h-[48px] px-3.5 rounded-xl bg-fx-base border border-fx-border focus:border-fx-orange focus:outline-none text-sm text-fx-text";

// La pantalla de ingreso valida contra su caché local (IndexedDB): se actualiza acá y se avisa por
// BroadcastChannel para que el molinete lo deje pasar en el acto, sin recargar.
async function pushToCheckInScreen(member: CachedMember) {
  try {
    await saveMembersToCache([member]);
  } catch {
    // IndexedDB no disponible: la pantalla de ingreso lo recibe igual por el canal.
  }
  gymBroadcast.postMessage({ type: "MEMBER_UPDATED", member });
}

export function QuickRenewModal({ target, plans, onClose, onRenewed }: QuickRenewModalProps) {
  if (!target) return null;
  // key: cada socio arranca con el formulario limpio.
  return <QuickRenewDialog key={target.id} target={target} plans={plans} onClose={onClose} onRenewed={onRenewed} />;
}

function QuickRenewDialog({ target, plans, onClose, onRenewed }: { target: QuickRenewTarget } & Omit<QuickRenewModalProps, "target">) {
  const initialPlan = plans.find((p) => p.id === target.planId) ?? plans[0];
  const [planId, setPlanId] = useState(initialPlan?.id ?? "");
  const [amount, setAmount] = useState(initialPlan ? String(initialPlan.price) : "");
  const [method, setMethod] = useState<PaymentMethodType>("EFECTIVO");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openedAt] = useState(() => Date.now());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !isSubmitting && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSubmitting, onClose]);

  const plan = plans.find((p) => p.id === planId);
  const preview = computeQuickRenewal(target.validUntil ? new Date(target.validUntil) : null, new Date(openedAt));
  const currentPlanUnavailable = Boolean(target.planId) && !plans.some((p) => p.id === target.planId);

  const handlePlanChange = (id: string) => {
    setPlanId(id);
    const next = plans.find((p) => p.id === id);
    if (next) setAmount(String(next.price));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan) return setError("Elegí un plan para renovar.");
    const parsedAmount = Number(amount.replace(",", "."));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return setError("Ingresá un monto mayor a cero.");
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await quickRenewMembership({ memberId: target.id, planId: plan.id, amount: parsedAmount, method });
      if (!res.success || !res.data) return setError(res.error || "No se pudo renovar la cuota.");
      if (res.data.cached) await pushToCheckInScreen(res.data.cached);
      onRenewed(res.data, target);
      onClose();
    } catch {
      setError("Sin conexión: la renovación no se guardó. Probá de nuevo cuando vuelva internet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="quick-renew-title" className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-fx-surface border border-fx-border rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-fx-border bg-fx-base/60">
          <div className="flex items-center gap-2.5">
            <RefreshCw className="w-5 h-5 text-fx-orange" />
            <h2 id="quick-renew-title" className="text-lg font-extrabold text-fx-text">Renovar cuota (+{QUICK_RENEWAL_DAYS} días)</h2>
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
            <p className="text-base font-extrabold text-fx-text">{target.fullName}</p>
            <p className="text-xs font-mono text-fx-muted">DNI: {target.dni} • {target.planName}</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-sm">
            <div className="p-3 rounded-xl bg-fx-base border border-fx-border">
              <span className="block text-xs font-bold uppercase text-fx-muted">Vencimiento actual</span>
              <b className="font-mono text-fx-text">{target.validUntil ? formatDateAR(target.validUntil) : "Sin cuota"}</b>
            </div>
            <div className="p-3 rounded-xl bg-fx-green/10 border border-fx-green/50">
              <span className="block text-xs font-bold uppercase text-fx-muted">Nuevo vencimiento</span>
              <b className="font-mono text-fx-green">{formatDateAR(preview.validUntil)}</b>
            </div>
          </div>
          <p className="text-xs text-fx-muted -mt-1">
            Se cuentan {QUICK_RENEWAL_DAYS} días desde hoy, sin importar el vencimiento anterior.
            {preview.diffDays !== null && preview.diffDays < 0 && ` Se descuentan ${-preview.diffDays} días que tenía de más.`}
          </p>

          <div>
            <label htmlFor="quick-renew-plan" className="block text-xs font-bold uppercase text-fx-muted mb-1.5">Plan</label>
            <select id="quick-renew-plan" value={planId} onChange={(e) => handlePlanChange(e.target.value)} className={INPUT_CLS}>
              {groupPlansByDiscipline(plans).map((g) => (
                <optgroup key={g.key} label={g.label}>
                  {g.plans.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — {formatCurrencyARS(p.price)}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {currentPlanUnavailable && (
              <p className="text-xs text-fx-amber mt-1">Su plan actual ({target.planName}) ya no está a la venta: elegí otro.</p>
            )}
          </div>

          <div>
            <span className="block text-xs font-bold uppercase text-fx-muted mb-1.5">Método de pago</span>
            <div className="grid grid-cols-2 gap-2.5">
              {(["EFECTIVO", "TRANSFERENCIA"] as PaymentMethodType[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  aria-pressed={method === m}
                  className={`min-h-[48px] rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    method === m ? "bg-fx-orange/20 border-fx-orange text-fx-text" : "bg-fx-base border-fx-border text-fx-muted hover:text-fx-text"
                  }`}
                >
                  {m === "EFECTIVO" ? "Efectivo" : "Transferencia"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="quick-renew-amount" className="block text-xs font-bold uppercase text-fx-muted mb-1.5">Monto cobrado</label>
            <input id="quick-renew-amount" type="text" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))} className={`${INPUT_CLS} font-mono`} />
          </div>

          <div className="pt-4 border-t border-fx-border flex items-center justify-end gap-2.5">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="min-h-[48px] px-4 rounded-xl bg-fx-hover text-sm font-bold text-fx-muted hover:text-fx-text cursor-pointer">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting || !plan} className="min-h-[48px] px-5 rounded-xl bg-fx-orange hover:bg-fx-orange/90 text-sm font-extrabold text-white inline-flex items-center gap-2 shadow-lg shadow-fx-orange/25 disabled:opacity-50 cursor-pointer">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Cobrar y renovar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
