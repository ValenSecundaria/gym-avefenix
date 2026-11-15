"use client";

import React from "react";
import { Clock, MapPin, MessageCircle, ExternalLink } from "lucide-react";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";
import { buildWhatsAppLink } from "@/lib/utils";
import { useAuth } from "@/context/auth-session-context";
import { MODALITIES } from "./modalities-data";
import { MagneticTiltCard } from "./MagneticTiltCard";

export function ScheduleSection() {
  const { user } = useAuth();
  const gymPhone = user?.gymPhone || GYM_BRAND_CONFIG.contact.defaultWhatsapp;
  const whatsappUrl = buildWhatsAppLink(gymPhone, GYM_BRAND_CONFIG.messages.generalInquiry());

  return (
    <section id="horarios" className="py-16 sm:py-20 px-4 sm:px-6 bg-brand-bg border-b border-brand-border">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-brand-border">
          <div className="border-l-4 border-brand-primary pl-4">
            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-primaryText block mb-1.5">
              DISCIPLINAS &amp; SEDE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-textPrimary uppercase tracking-tight">
              Modalidades y Horarios
            </h2>
          </div>

          <a
            href={GYM_BRAND_CONFIG.contact.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[48px] px-5 rounded-md border border-brand-border bg-brand-surface hover:border-brand-primary text-brand-textPrimary font-bold text-sm inline-flex items-center justify-center gap-2 transition-colors self-start sm:self-auto"
          >
            <MapPin className="w-4 h-4 text-brand-primaryText" />
            <span>Ver en Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MODALITIES.map((mod) => {
              const Icon = mod.icon;
              return (
                <MagneticTiltCard
                  key={mod.name}
                  className="p-5 rounded-lg border border-brand-border bg-brand-surface hover:border-brand-primary/60 flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-md bg-brand-primary/15 border border-brand-primary/30 text-brand-primaryText flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-brand-textPrimary uppercase tracking-wide mb-1">
                        {mod.name}
                      </h3>
                      <p className="text-sm text-brand-textSecondary leading-relaxed">
                        {mod.description}
                      </p>
                    </div>
                  </div>
                </MagneticTiltCard>
              );
            })}
          </div>

          <div className="lg:col-span-5 p-6 rounded-lg border-2 border-brand-border bg-brand-surface flex flex-col justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-brand-border">
                <div className="w-10 h-10 rounded-md bg-brand-primary text-white flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-brand-textPrimary uppercase tracking-tight">
                    Horarios de Apertura
                  </h3>
                  <p className="text-xs font-semibold text-brand-textSecondary">
                    {GYM_BRAND_CONFIG.contact.address}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-brand-border">
                {GYM_BRAND_CONFIG.contact.schedule.map((row) => (
                  <div key={row.days} className="flex items-center justify-between py-3.5 gap-3">
                    <span className="text-sm font-bold text-brand-textSecondary">{row.days}</span>
                    <span className="font-mono text-sm font-extrabold text-brand-textPrimary">
                      {row.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[52px] px-5 rounded-md bg-brand-primary hover:bg-brand-primaryHover text-white font-extrabold text-sm sm:text-base uppercase tracking-wide inline-flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Consultar por WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
