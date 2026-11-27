"use client";

import React from "react";
import { Clock, ExternalLink, MapPin, MessageCircle } from "lucide-react";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";
import { buildWhatsAppLink } from "@/lib/utils";
import { useAuth } from "@/context/auth-session-context";
import { MODALITIES } from "./modalities-data";

export function ScheduleSection() {
  const { user } = useAuth();
  const gymPhone = (user?.gymPhone || GYM_BRAND_CONFIG.contact.defaultWhatsapp).trim();
  const hasWhatsapp = gymPhone.length > 0;
  const whatsappUrl = hasWhatsapp
    ? buildWhatsAppLink(gymPhone, GYM_BRAND_CONFIG.messages.generalInquiry())
    : "";

  return (
    <section
      id="horarios"
      className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-brand-bg border-b-2 border-brand-border"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        <div className="max-w-2xl space-y-2">
          <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-brand-primaryText block">
            {"//"} CRONOGRAMA OPERATIVO • {GYM_BRAND_CONFIG.contact.address}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-brand-textPrimary tracking-tight">
            Horarios de Entrenamiento y Sede
          </h2>
          <p className="text-base text-brand-textSecondary">
            Doble franja de lunes a viernes y turno vespertino los sábados en {GYM_BRAND_CONFIG.identity.city}.
          </p>
        </div>

        {/* Pizarra horizontal de 3 bloques horarios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {GYM_BRAND_CONFIG.contact.schedule.map((row, idx) => {
            const isClosed = row.hours.toLowerCase().includes("cerrado");
            const tag = isClosed ? "DESCANSO" : idx === 0 ? "DOBLE TURNO" : "TURNO SÁBADO";
            return (
              <div
                key={row.days}
                className={`p-5 sm:p-6 rounded-lg border bg-brand-surface flex flex-col justify-between gap-3 ${
                  isClosed
                    ? "border-brand-border opacity-80"
                    : "border-brand-border border-t-4 border-t-brand-primary shadow-md"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider text-brand-textPrimary">
                    <Clock className="w-4 h-4 text-brand-primaryText" aria-hidden="true" />
                    {row.days}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-sm font-mono text-[11px] font-extrabold uppercase ${
                      isClosed
                        ? "bg-brand-bg text-brand-textSecondary border border-brand-border"
                        : "bg-brand-primary/15 text-brand-primaryText border border-brand-primary/40"
                    }`}
                  >
                    {tag}
                  </span>
                </div>
                <p
                  className={`font-mono text-base sm:text-lg font-extrabold ${
                    isClosed ? "text-brand-textSecondary" : "text-brand-textPrimary"
                  }`}
                >
                  {row.hours}
                </p>
              </div>
            );
          })}
        </div>

        {/* Matriz 8 / 4: Modalidades a la izquierda + Bloque de Ubicación a la derecha */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MODALITIES.map((mod) => {
              const Icon = mod.icon;
              return (
                <article
                  key={mod.name}
                  className="p-6 rounded-lg bg-brand-surface border border-brand-border hover:border-brand-primary/60 flex flex-col justify-between gap-4 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="w-10 h-10 rounded-md bg-brand-bg border border-brand-border flex items-center justify-center shrink-0">
                        <Icon className={`w-5 h-5 ${mod.accent}`} aria-hidden="true" />
                      </span>
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm bg-brand-bg border border-brand-border text-brand-textSecondary">
                        {mod.level}
                      </span>
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-brand-textPrimary">
                      {mod.name}
                    </h3>
                    <p className="text-sm text-brand-textSecondary leading-relaxed">{mod.description}</p>
                  </div>
                  <p className="font-mono text-xs font-bold text-brand-primaryText pt-3 border-t border-brand-border">
                    {mod.schedule}
                  </p>
                </article>
              );
            })}
          </div>

          <aside className="lg:col-span-4 p-6 sm:p-7 rounded-lg bg-brand-surface border-2 border-brand-border border-l-4 border-l-brand-primary flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-brand-primaryText block">
                [ SEDE FÍSICA ]
              </span>
              <h3 className="text-2xl font-black uppercase text-brand-textPrimary leading-tight">
                {GYM_BRAND_CONFIG.contact.address}
              </h3>
              <p className="text-sm text-brand-textSecondary leading-relaxed">
                Entrená en {GYM_BRAND_CONFIG.identity.name}, en pleno {GYM_BRAND_CONFIG.identity.city}. Atención directa en recepción para altas, renovaciones y consultas.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={GYM_BRAND_CONFIG.contact.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[52px] px-5 rounded-md bg-brand-primary hover:bg-brand-primaryHover text-[#0A0B0D] font-black uppercase tracking-wider text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors"
              >
                <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Abrir en Google Maps</span>
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </a>

              {hasWhatsapp && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[48px] px-5 rounded-md bg-[#25D366] hover:bg-[#25D366]/90 text-[#0A0B0D] font-black uppercase tracking-wider text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Consultar por WhatsApp</span>
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
