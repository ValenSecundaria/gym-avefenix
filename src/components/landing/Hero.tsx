"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, MapPin, MessageCircle, ShieldCheck, Users } from "lucide-react";
import { useAuth } from "@/context/auth-session-context";
import { buildWhatsAppLink } from "@/lib/utils";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";
import { PILLARS } from "./hero-data";

interface HeroProps {
  activeMembers?: number;
}

export function Hero({ activeMembers }: HeroProps) {
  const { user } = useAuth();
  const gymPhone = (user?.gymPhone || GYM_BRAND_CONFIG.contact.defaultWhatsapp).trim();
  const hasWhatsapp = gymPhone.length > 0;
  const whatsappUrl = hasWhatsapp
    ? buildWhatsAppLink(gymPhone, GYM_BRAND_CONFIG.messages.generalInquiry())
    : "";

  const activeCount = typeof activeMembers === "number" ? activeMembers : 0;
  const weekdaySchedule = GYM_BRAND_CONFIG.contact.schedule[0];
  const saturdaySchedule = GYM_BRAND_CONFIG.contact.schedule[1];

  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-brand-bg pt-10 pb-16 sm:pt-14 sm:pb-20 px-4 sm:px-6 lg:px-8 border-b-2 border-brand-border"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#2A2E3726_1px,transparent_1px),linear-gradient(to_bottom,#2A2E3726_1px,transparent_1px)] bg-[size:48px_48px]"
      />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col gap-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between items-start text-left gap-8">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-3 px-3.5 py-2 rounded-r-md bg-brand-surface border border-brand-border border-l-4 border-l-brand-primary">
                <span className="w-2 h-2 rounded-xs bg-brand-primary" aria-hidden="true" />
                <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-brand-primaryText">
                  TEMPLO DE FUERZA {"//"} {GYM_BRAND_CONFIG.contact.address} • {GYM_BRAND_CONFIG.identity.city}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black uppercase text-brand-textPrimary leading-[1.04] tracking-tight">
                {GYM_BRAND_CONFIG.identity.heroTitle}
              </h1>

              <p className="text-base sm:text-lg text-brand-textSecondary max-w-2xl leading-relaxed">
                {GYM_BRAND_CONFIG.identity.heroSubtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {hasWhatsapp ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[52px] px-6 rounded-md bg-brand-primary hover:bg-brand-primaryHover text-[#0A0B0D] font-black uppercase tracking-wider text-sm sm:text-[15px] inline-flex items-center justify-center gap-2.5 shadow-lg shadow-brand-primary/20 transition-all"
                  >
                    <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span>Consultar por WhatsApp</span>
                  </a>
                ) : (
                  <a
                    href="#planes"
                    className="min-h-[52px] px-6 rounded-md bg-brand-primary hover:bg-brand-primaryHover text-[#0A0B0D] font-black uppercase tracking-wider text-sm sm:text-[15px] inline-flex items-center justify-center gap-2.5 transition-all"
                  >
                    <span>Ver Planes Vigentes</span>
                    <ArrowRight className="w-5 h-5 shrink-0" aria-hidden="true" />
                  </a>
                )}

                <a
                  href={GYM_BRAND_CONFIG.contact.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[52px] px-5 rounded-md bg-brand-surface hover:bg-brand-surfaceHover border border-brand-border hover:border-brand-primary text-brand-textPrimary font-bold text-sm sm:text-[15px] inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <MapPin className="w-5 h-5 text-brand-primaryText shrink-0" aria-hidden="true" />
                  <span>Ubicación: {GYM_BRAND_CONFIG.contact.address}</span>
                </a>

                {user && (
                  <Link
                    href={user.role === "ADMIN" ? "/admin" : "/profesor"}
                    className="min-h-[52px] px-5 rounded-md border border-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primaryText font-bold text-sm inline-flex items-center gap-2 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Mi Panel ({user.name})</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="w-full grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-brand-border rounded-lg border border-brand-border bg-brand-surface overflow-hidden">
              <div className="p-4 flex flex-col gap-1">
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-brand-primaryText inline-flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Comunidad Activa</span>
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-black text-brand-textPrimary leading-none">
                  {activeCount}
                </span>
                <span className="text-xs text-brand-textSecondary">Socios entrenando</span>
              </div>

              <div className="p-4 flex flex-col gap-1">
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#10B981] inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{weekdaySchedule?.days ?? "Lun a Vie"}</span>
                </span>
                <span className="font-mono text-sm sm:text-[15px] font-extrabold text-brand-textPrimary leading-snug">
                  07:30–11:30 / 19:00–23:00
                </span>
                <span className="text-xs text-brand-textSecondary">Doble turno diario</span>
              </div>

              <div className="p-4 flex flex-col gap-1">
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-brand-warning inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{saturdaySchedule?.days ?? "Sábados"}</span>
                </span>
                <span className="font-mono text-base sm:text-lg font-black text-brand-textPrimary leading-snug">
                  {saturdaySchedule?.hours ?? "19:00 a 21:00 hs"}
                </span>
                <span className="text-xs text-brand-textSecondary">{GYM_BRAND_CONFIG.contact.address}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex">
            <div className="w-full rounded-lg bg-brand-surface border-2 border-brand-border overflow-hidden shadow-2xl flex flex-col justify-between">
              <div className="px-4 py-2.5 bg-brand-bg border-b border-brand-border flex items-center justify-between gap-2 font-mono text-xs">
                <span className="inline-flex items-center gap-2 font-bold text-brand-primaryText uppercase">
                  <span className="w-2 h-2 bg-brand-primary inline-block" aria-hidden="true" />
                  {GYM_BRAND_CONFIG.identity.shortName} {"//"} SALA CENTRAL
                </span>
                <span className="text-brand-textSecondary">{GYM_BRAND_CONFIG.contact.address}</span>
              </div>

              <div className="relative aspect-[16/11] w-full bg-brand-bg flex-1 min-h-[260px]">
                <Image
                  src={GYM_BRAND_CONFIG.assets.heroCover}
                  alt={`Sala de entrenamiento de ${GYM_BRAND_CONFIG.identity.name}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover"
                />
              </div>

              <div className="p-4 bg-brand-bg border-t border-brand-border flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-brand-textSecondary">
                    Equipamiento Olímpico &amp; Acero
                  </p>
                  <p className="text-sm font-extrabold text-brand-textPrimary">
                    Conocé cada zona de {GYM_BRAND_CONFIG.identity.name}
                  </p>
                </div>
                <a
                  href="#instalaciones"
                  className="min-h-[48px] px-4 rounded-md bg-brand-surface hover:bg-brand-surfaceHover border border-brand-border hover:border-brand-primary text-xs font-extrabold uppercase tracking-wider text-brand-primaryText inline-flex items-center gap-2 transition-colors"
                >
                  <span>Ver sectores</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-brand-border border border-brand-border rounded-lg overflow-hidden">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article key={pillar.code} className="p-6 bg-brand-surface hover:bg-brand-surfaceHover transition-colors flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xl font-black text-brand-primaryText">/{pillar.code}</span>
                    <span className="w-10 h-10 rounded-md bg-brand-bg border border-brand-border text-brand-primaryText flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </span>
                  </div>
                  <h2 className="text-base font-extrabold uppercase tracking-wide text-brand-textPrimary">
                    {pillar.title}
                  </h2>
                  <p className="text-sm text-brand-textSecondary leading-relaxed">{pillar.description}</p>
                </div>
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-brand-primaryText pt-3 border-t border-brand-border">
                  [ {pillar.tag} ]
                </span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
