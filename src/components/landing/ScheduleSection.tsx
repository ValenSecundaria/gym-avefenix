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
      className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-brand-bg border-b border-brand-border"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-primaryText block">
            Horarios &amp; Disciplinas
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-brand-textPrimary tracking-tight">
            Organizá tu semana de entrenamiento
          </h2>
          <p className="text-base text-brand-textSecondary">
            Amplia franja horaria de lunes a viernes en {GYM_BRAND_CONFIG.contact.address}, {GYM_BRAND_CONFIG.identity.city}.
          </p>
        </div>

        {/* Layout invertido: Tarjeta de Sede y Horarios a la izquierda (5) + Grilla de Modalidades a la derecha (7) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-brand-surface border border-brand-border border-t-4 border-t-brand-primary shadow-xl flex flex-col justify-between gap-6">
            <div className="space-y-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary text-white flex items-center justify-center shrink-0 shadow-md shadow-brand-primary/25">
                  <Clock className="w-6 h-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-brand-textPrimary">Horarios de Atención</h3>
                  <p className="text-sm text-brand-textSecondary">
                    {GYM_BRAND_CONFIG.contact.address} • {GYM_BRAND_CONFIG.identity.city}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                {GYM_BRAND_CONFIG.contact.schedule.map((row) => {
                  const isClosed = row.hours.toLowerCase().includes("cerrado");
                  return (
                    <div
                      key={row.days}
                      className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-brand-bg border border-brand-border"
                    >
                      <span className="text-sm sm:text-[15px] font-bold text-brand-textPrimary">
                        {row.days}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full font-mono text-xs sm:text-sm font-extrabold ${
                          isClosed
                            ? "bg-brand-surface text-brand-textSecondary border border-brand-border"
                            : "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/40"
                        }`}
                      >
                        {row.hours}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={GYM_BRAND_CONFIG.contact.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[52px] px-5 rounded-2xl bg-brand-primary hover:bg-brand-primaryHover text-white font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 shadow-md shadow-brand-primary/20 transition-colors"
              >
                <MapPin className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>Abrir ubicación en Google Maps</span>
                <ExternalLink className="w-4 h-4 opacity-80" aria-hidden="true" />
              </a>

              {hasWhatsapp && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[48px] px-5 rounded-2xl bg-[#25D366] hover:bg-[#25D366]/90 text-brand-bg font-extrabold text-sm inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>Consultar por WhatsApp</span>
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MODALITIES.map((mod) => {
              const Icon = mod.icon;
              return (
                <article
                  key={mod.name}
                  className="p-6 rounded-3xl bg-brand-surface border border-brand-border hover:border-brand-primary/50 shadow-md flex flex-col justify-between gap-4 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="w-11 h-11 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center shrink-0">
                        <Icon className={`w-5 h-5 ${mod.accent}`} aria-hidden="true" />
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-brand-bg border border-brand-border text-brand-textSecondary">
                        {mod.level}
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-brand-textPrimary">{mod.name}</h3>
                    <p className="text-sm text-brand-textSecondary leading-relaxed">{mod.description}</p>
                  </div>
                  <p className="text-xs font-mono font-semibold text-brand-primaryText pt-3 border-t border-brand-border">
                    {mod.schedule}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
