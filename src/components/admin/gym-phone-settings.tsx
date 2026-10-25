"use client";

import React, { useState } from "react";
import { Phone, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-session-context";
import { updateGymPhoneAction } from "@/actions/settings.actions";

export function GymPhoneSettings() {
  const { user, updateCurrentGymPhone } = useAuth();
  const userPhone = user?.gymPhone ?? "5492915768403";
  const [phone, setPhone] = useState(userPhone);
  const [prevUserPhone, setPrevUserPhone] = useState(userPhone);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  if (user?.gymPhone && user.gymPhone !== prevUserPhone) {
    setPrevUserPhone(user.gymPhone);
    setPhone(user.gymPhone);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSaving(true);
    try {
      const res = await updateGymPhoneAction({ userId: user?.id, gymPhone: phone.trim() });
      if (res.success) {
        await updateCurrentGymPhone(res.updatedPhone);
        setPhone(res.updatedPhone);
        setFeedback({ type: "success", message: `WhatsApp institucional actualizado a +${res.updatedPhone}.` });
      } else {
        setFeedback({ type: "error", message: res.error || "No se pudo actualizar el número de WhatsApp." });
      }
    } catch {
      setFeedback({ type: "error", message: "Error inesperado al conectar con el servidor." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto w-full py-4 space-y-6">
      <div>
        <h3 className="text-xl font-extrabold text-fx-text flex items-center gap-2">
          <Phone className="w-5 h-5 text-fx-orange" />
          WhatsApp Institucional del Gimnasio
        </h3>
        <p className="text-sm text-fx-muted mt-1 leading-relaxed">
          Número de contacto oficial utilizado en la web pública, botones de WhatsApp y enlaces para socios.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="gym-phone-input" className="text-xs font-bold uppercase tracking-wider text-fx-muted">
            Número de Teléfono (con código de área)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-fx-muted select-none">
              +
            </span>
            <input
              id="gym-phone-input"
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="5492915768403"
              disabled={isSaving}
              required
              className="w-full min-h-[48px] pl-8 pr-4 rounded-xl bg-fx-base border border-fx-border focus:border-fx-orange focus:outline-none text-sm text-fx-text font-mono transition-colors disabled:opacity-50"
            />
          </div>
          <span className="text-xs text-fx-muted">
            Ejemplo Bahía Blanca / White: 5492915768403 (Prefijo 549 + código de área + número).
          </span>
        </div>

        {feedback && (
          <div
            className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-sm font-medium ${
              feedback.type === "success" ? "bg-fx-green/10 border-fx-green text-fx-green" : "bg-fx-red/10 border-fx-red text-fx-red"
            }`}
            role="status"
          >
            {feedback.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
            <span>{feedback.message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-fx-orange hover:bg-fx-orange/90 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-fx-orange/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <span>Guardar Teléfono</span>
          )}
        </button>
      </form>
    </div>
  );
}
