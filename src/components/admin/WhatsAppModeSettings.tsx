"use client";

import React, { useState } from "react";
import { CheckCircle2, MessageCircle } from "lucide-react";
import type { WhatsAppTarget } from "@/lib/whatsapp-dispatcher";
import { DEFAULT_WHATSAPP_TARGET, getWhatsAppTarget, setWhatsAppTarget } from "@/lib/whatsapp-preference";

const OPTIONS: { target: WhatsAppTarget; title: string; description: string }[] = [
  {
    target: "web",
    title: "WhatsApp Web",
    description: "Abre web.whatsapp.com en este navegador (Chrome o Edge). La primera vez pide escanear el QR con el celular del gimnasio.",
  },
  {
    target: "app",
    title: "App de Windows",
    description: "Abre la aplicación de WhatsApp instalada en esta computadora.",
  },
  {
    target: "auto",
    title: "Automático",
    description: "wa.me: abre la app si está instalada; si no, ofrece continuar en WhatsApp Web.",
  },
];

/** Preferencia de cada computadora: la de recepción puede usar WhatsApp Web y otra la app de Windows. */
export function WhatsAppModeSettings() {
  // La sección de Configuración solo se muestra en el navegador (no en el render del servidor).
  const [target, setTarget] = useState<WhatsAppTarget>(() =>
    typeof window === "undefined" ? DEFAULT_WHATSAPP_TARGET : getWhatsAppTarget()
  );
  const [saved, setSaved] = useState(false);

  const choose = (t: WhatsAppTarget) => {
    setWhatsAppTarget(t);
    setTarget(t);
    setSaved(true);
  };

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-extrabold text-fx-text flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-[#25D366]" />
          Cómo abrir WhatsApp en esta computadora
        </h3>
        <p className="text-sm text-fx-muted mt-1">Se usa en los avisos a socios. Se guarda solo en este equipo.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3" role="radiogroup" aria-label="Cómo abrir WhatsApp">
        {OPTIONS.map((o) => (
          <button
            key={o.target}
            type="button"
            role="radio"
            aria-checked={target === o.target}
            onClick={() => choose(o.target)}
            className={`text-left p-4 rounded-xl border transition-colors cursor-pointer ${
              target === o.target ? "bg-[#25D366]/10 border-[#25D366]" : "bg-fx-base border-fx-border hover:border-fx-orange/60"
            }`}
          >
            <span className="block font-bold text-fx-text">
              {o.title}
              {o.target === DEFAULT_WHATSAPP_TARGET && <span className="ml-2 text-xs font-semibold text-fx-muted">(por defecto)</span>}
            </span>
            <span className="block text-xs text-fx-muted mt-1">{o.description}</span>
          </button>
        ))}
      </div>
      {saved && (
        <p role="status" className="text-sm font-bold text-fx-green inline-flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Preferencia guardada en esta computadora.
        </p>
      )}
    </section>
  );
}
