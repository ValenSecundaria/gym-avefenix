"use client";

import React, { useState } from "react";
import { CheckCircle2, MessageCircle } from "lucide-react";
import type { WhatsAppMode } from "@/lib/utils";
import { getWhatsAppMode, setWhatsAppMode } from "@/lib/whatsapp-preference";

const OPTIONS: { mode: WhatsAppMode; title: string; description: string }[] = [
  { mode: "AUTO", title: "Automático", description: "wa.me: en el celular abre la app; en la PC muestra una página para elegir." },
  { mode: "WEB", title: "WhatsApp Web", description: "Abre web.whatsapp.com en el navegador (hay que tener la sesión iniciada ahí)." },
  { mode: "APP", title: "WhatsApp Desktop", description: "Abre la app de WhatsApp instalada en Windows directamente." },
];

/** Preferencia de cada computadora: la de recepción puede usar la app y el celular el modo automático. */
export function WhatsAppModeSettings() {
  // La sección de Configuración solo se muestra en el navegador (no en el render del servidor).
  const [mode, setMode] = useState<WhatsAppMode>(() => (typeof window === "undefined" ? "AUTO" : getWhatsAppMode()));
  const [saved, setSaved] = useState(false);

  const choose = (m: WhatsAppMode) => {
    setWhatsAppMode(m);
    setMode(m);
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
            key={o.mode}
            type="button"
            role="radio"
            aria-checked={mode === o.mode}
            onClick={() => choose(o.mode)}
            className={`text-left p-4 rounded-xl border transition-colors cursor-pointer ${
              mode === o.mode ? "bg-[#25D366]/10 border-[#25D366]" : "bg-fx-base border-fx-border hover:border-fx-orange/60"
            }`}
          >
            <span className="block font-bold text-fx-text">{o.title}</span>
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
