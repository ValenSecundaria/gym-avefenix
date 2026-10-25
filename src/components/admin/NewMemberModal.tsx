"use client";

import React, { useState } from "react";
import { X, Check, Loader2, AlertCircle, Flame } from "lucide-react";
import type { PaymentMethodType, PlanOption } from "@/types";
import { formatCurrencyARS } from "@/lib/utils";
import { PlanPicker } from "./PlanPicker";
import { sanitizeNameInput, sanitizePhoneInput } from "@/lib/validations/member.schema";
import { WebcamCapture } from "./WebcamCapture";

export interface NewMemberFormValues {
  fullName: string;
  dni: string;
  phone: string;
  planId: string;
  paymentMethod: PaymentMethodType;
  photoBase64: string | null;
  notes?: string;
}

interface NewMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: PlanOption[];
  onSubmitMember: (data: NewMemberFormValues) => Promise<{ success: boolean; error?: string }>;
}

const INPUT_CLS =
  "w-full min-h-[48px] px-4 rounded-xl bg-fx-base border border-fx-border focus:border-fx-orange focus:outline-none text-sm text-fx-text";
const LABEL_CLS = "block text-xs font-bold uppercase tracking-wider text-fx-muted mb-1.5";

export function NewMemberModal({ isOpen, onClose, plans, onSubmitMember }: NewMemberModalProps) {
  const [fullName, setFullName] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("EFECTIVO");
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;
  const selectedPlan = plans.find((p) => p.id === planId) ?? plans[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanDni = dni.replace(/\D/g, "");
    if (!fullName.trim()) return setError("Ingresá el nombre y apellido del socio.");
    if (cleanDni.length < 6 || cleanDni.length > 8) return setError("El DNI debe tener 6 a 8 dígitos.");
    if (!selectedPlan) return setError("Seleccioná un plan válido.");

    setIsSubmitting(true);
    try {
      const res = await onSubmitMember({
        fullName: fullName.trim(),
        dni: cleanDni,
        phone: phone.trim(),
        planId: selectedPlan.id,
        paymentMethod,
        photoBase64,
        notes: notes.trim() || undefined,
      });
      if (!res.success) return setError(res.error || "No se pudo registrar el socio.");
      onClose();
    } catch {
      setError("Error inesperado al guardar el alta del socio.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="new-member-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-fx-surface border border-fx-border w-full max-w-4xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-6 sm:p-8 flex flex-col gap-6 my-auto">
        <div className="flex items-start justify-between pb-4 border-b border-fx-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fx-orange to-fx-red flex items-center justify-center text-white shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 id="new-member-title" className="text-lg sm:text-xl text-fx-text font-extrabold tracking-tight">
                Registrar Nuevo Socio en Gimnasio Ave Fénix
              </h2>
              <p className="text-xs text-fx-muted">Enrolamiento inmediato para apertura automática del molinete principal.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={isSubmitting} aria-label="Cerrar" className="w-10 h-10 rounded-xl bg-fx-base border border-fx-border text-fx-muted hover:text-fx-text flex items-center justify-center cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5">
            <WebcamCapture photoDataUrl={photoBase64} onPhotoCapture={setPhotoBase64} />
          </div>

          <div className="md:col-span-7 flex flex-col gap-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-fx-red/20 border border-fx-red text-xs sm:text-sm text-fx-text">
                <AlertCircle className="w-4 h-4 text-fx-red shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div>
              <label className={LABEL_CLS}>Nombre y Apellido *</label>
              <input type="text" required value={fullName} onChange={(e) => setFullName(sanitizeNameInput(e.target.value))} placeholder="Ej: Mariano Alejandro Castro" className={INPUT_CLS} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLS}>Número de DNI *</label>
                <input type="text" inputMode="numeric" required value={dni} onChange={(e) => setDni(e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="Ej: 40123456" className={`${INPUT_CLS} font-mono`} />
              </div>
              <div>
                <label className={LABEL_CLS}>Teléfono / WhatsApp</label>
                <input type="tel" inputMode="numeric" value={phone} onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))} placeholder="Solo números, ej: 1154923810" className={INPUT_CLS} />
              </div>
            </div>

            <div>
              <span className={LABEL_CLS}>Plan Seleccionado *</span>
              <PlanPicker plans={plans} selectedPlanId={selectedPlan?.id ?? ""} onSelect={setPlanId} />
            </div>

            <div className="p-4 rounded-xl bg-fx-base border border-fx-border flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-fx-muted uppercase tracking-wider font-bold">Método de Cobro Inicial</span>
                <span className="font-mono text-lg text-fx-orange font-extrabold">{selectedPlan ? formatCurrencyARS(selectedPlan.price) : "$0"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(["EFECTIVO", "TRANSFERENCIA"] as PaymentMethodType[]).map((m) => (
                  <button key={m} type="button" onClick={() => setPaymentMethod(m)} className={`min-h-[48px] rounded-xl text-xs font-bold border transition-all cursor-pointer ${paymentMethod === m ? "bg-fx-orange/20 border-fx-orange text-fx-text" : "bg-fx-surface border-fx-border text-fx-muted hover:text-fx-text"}`}>
                    {m === "EFECTIVO" ? "Efectivo en Caja" : "Transferencia / QR"}
                  </button>
                ))}
              </div>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observaciones opcionales..." className={INPUT_CLS} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-fx-border">
              <button type="button" onClick={onClose} disabled={isSubmitting} className="min-h-[48px] px-6 rounded-xl bg-fx-base border border-fx-border text-fx-muted hover:text-fx-text font-semibold text-sm cursor-pointer">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting} className="min-h-[50px] px-7 rounded-xl bg-fx-orange hover:bg-fx-orange/90 text-white font-bold text-sm inline-flex items-center gap-2 shadow-[0_4px_20px_rgba(249,87,22,0.4)] disabled:opacity-50 cursor-pointer">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                <span>✓ Guardar y Habilitar Socio</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
