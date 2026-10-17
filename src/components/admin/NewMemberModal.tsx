"use client";

import React, { useState } from "react";
import { X, Check, Loader2, AlertCircle, Flame } from "lucide-react";
import type { PaymentMethodType, PlanOption } from "@/types";
import { formatCurrencyARS } from "@/lib/utils";
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
  "w-full min-h-[48px] px-4 rounded-xl bg-[#0B0B0C] border border-[#2C2D35] focus:border-[#F95716] focus:outline-none text-sm text-[#F4F5F7]";
const LABEL_CLS = "block text-xs font-bold uppercase tracking-wider text-[#8A909A] mb-1.5";

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
      <div className="bg-[#17171C] border border-[#2C2D35] w-full max-w-4xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-6 sm:p-8 flex flex-col gap-6 my-auto">
        <div className="flex items-start justify-between pb-4 border-b border-[#2C2D35]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F95716] to-[#D92614] flex items-center justify-center text-white shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 id="new-member-title" className="text-lg sm:text-xl text-[#F4F5F7] font-extrabold tracking-tight">
                Registrar Nuevo Socio en Gimnasio Ave Fénix
              </h2>
              <p className="text-xs text-[#8A909A]">Enrolamiento inmediato para apertura automática del molinete principal.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={isSubmitting} aria-label="Cerrar" className="w-10 h-10 rounded-xl bg-[#0B0B0C] border border-[#2C2D35] text-[#8A909A] hover:text-[#F4F5F7] flex items-center justify-center cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5">
            <WebcamCapture photoDataUrl={photoBase64} onPhotoCapture={setPhotoBase64} />
          </div>

          <div className="md:col-span-7 flex flex-col gap-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#D92614]/20 border border-[#D92614] text-xs sm:text-sm text-[#F4F5F7]">
                <AlertCircle className="w-4 h-4 text-[#D92614] shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div>
              <label className={LABEL_CLS}>Nombre y Apellido *</label>
              <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ej: Mariano Alejandro Castro" className={INPUT_CLS} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLS}>Número de DNI *</label>
                <input type="text" inputMode="numeric" required value={dni} onChange={(e) => setDni(e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="Sin puntos (6 a 8 dígitos)" className={`${INPUT_CLS} font-mono`} />
              </div>
              <div>
                <label className={LABEL_CLS}>Teléfono / WhatsApp</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ej: 11-5492-3810" className={INPUT_CLS} />
              </div>
            </div>

            <div>
              <label className={LABEL_CLS}>Plan Seleccionado *</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {plans.map((p) => {
                  const active = selectedPlan?.id === p.id;
                  return (
                    <button key={p.id} type="button" onClick={() => setPlanId(p.id)} className={`min-h-[48px] px-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer border ${active ? "bg-[#F95716] text-white border-[#F95716]" : "bg-[#0B0B0C] border-[#2C2D35] text-[#8A909A] hover:text-[#F4F5F7]"}`}>
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0B0C] border border-[#2C2D35] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8A909A] uppercase tracking-wider font-bold">Método de Cobro Inicial</span>
                <span className="font-mono text-lg text-[#F95716] font-extrabold">{selectedPlan ? formatCurrencyARS(selectedPlan.price) : "$0"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(["EFECTIVO", "TRANSFERENCIA"] as PaymentMethodType[]).map((m) => (
                  <button key={m} type="button" onClick={() => setPaymentMethod(m)} className={`min-h-[48px] rounded-xl text-xs font-bold border transition-all cursor-pointer ${paymentMethod === m ? "bg-[#F95716]/20 border-[#F95716] text-[#F4F5F7]" : "bg-[#17171C] border-[#2C2D35] text-[#8A909A] hover:text-[#F4F5F7]"}`}>
                    {m === "EFECTIVO" ? "Efectivo en Caja" : "Transferencia / QR"}
                  </button>
                ))}
              </div>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observaciones opcionales..." className={INPUT_CLS} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#2C2D35]">
              <button type="button" onClick={onClose} disabled={isSubmitting} className="min-h-[48px] px-6 rounded-xl bg-[#0B0B0C] border border-[#2C2D35] text-[#8A909A] hover:text-[#F4F5F7] font-semibold text-sm cursor-pointer">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting} className="min-h-[50px] px-7 rounded-xl bg-[#F95716] hover:bg-[#F95716]/90 text-white font-bold text-sm inline-flex items-center gap-2 shadow-[0_4px_20px_rgba(249,87,22,0.4)] disabled:opacity-50 cursor-pointer">
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
