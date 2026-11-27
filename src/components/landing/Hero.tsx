"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Clock,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
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
  const mainSchedule = GYM_BRAND_CONFIG.contact.schedule[0];

  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-brand-bg pt-10 pb-16 sm:pt-14 sm:pb-24 px-4 sm:px-6 lg:px-8 border-b border-brand-border"
    >
      {/* Resplandor ambiental suave */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-1/4 w-[480px] h-[480px] rounded-full bg-brand-primary/12 blur-[130px]"
      />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col gap-12 lg:gap-14">
        {/* Bloque superior: División editorial 6 / 6 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-brand-surface border border-brand-border shadow-sm mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-textPrimary">
                Salud • Fuerza • HIIT en {GYM_BRAND_CONFIG.contact.address}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-black text-brand-textPrimary leading-[1.08] tracking-tight mb-5">
              {GYM_BRAND_CONFIG.identity.heroTitle}
            </h1>

            <p className="text-base sm:text-lg text-brand-textSecondary max-w-xl mb-8 leading-relaxed">
              {GYM_BRAND_CONFIG.identity.heroSubtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3.5 w-full sm:w-auto mb-8">
              {hasWhatsapp ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[52px] px-7 rounded-2xl bg-brand-primary hover:bg-brand-primaryHover text-white font-bold text-base inline-flex items-center justify-center gap-2.5 shadow-lg shadow-brand-primary/25 transition-all"
                >
                  <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>Consultar por WhatsApp</span>
                </a>
              ) : (
                <a
                  href="#planes"
                  className="min-h-[52px] px-7 rounded-2xl bg-brand-primary hover:bg-brand-primaryHover text-white font-bold text-base inline-flex items-center justify-center gap-2.5 shadow-lg shadow-brand-primary/25 transition-all"
                >
                  <span>Ver Planes y Modalidades</span>
                  <ArrowRight className="w-5 h-5 shrink-0" aria-hidden="true" />
                </a>
              )}

              <a
                href={GYM_BRAND_CONFIG.contact.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[52px] px-6 rounded-2xl bg-brand-surface hover:bg-brand-surfaceHover border border-brand-border hover:border-brand-primary/50 text-brand-textPrimary font-semibold text-base inline-flex items-center justify-center gap-2 transition-colors"
              >
                <MapPin className="w-5 h-5 text-brand-primaryText shrink-0" aria-hidden="true" />
                <span>Cómo llegar ({GYM_BRAND_CONFIG.contact.address})</span>
              </a>

              {user && (
                <Link
                  href={user.role === "ADMIN" ? "/admin" : "/profesor"}
                  className="min-h-[52px] px-5 rounded-2xl border border-brand-primary/50 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primaryText font-bold text-sm inline-flex items-center gap-2 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Mi Panel ({user.name})</span>
                </Link>
              )}
            </div>

            {/* Indicadores rápidos redondeados */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
              <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border">
                <div className="flex items-center gap-1.5 text-brand-primaryText text-xs font-bold uppercase tracking-wider mb-1">
                  <Users className="w-4 h-4" aria-hidden="true" />
                  <span>Comunidad</span>
                </div>
                <p className="text-2xl font-black font-mono text-brand-textPrimary">{activeCount}</p>
                <p className="text-xs text-brand-textSecondary">Socios activos</p>
              </div>
              <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border">
                <div className="flex items-center gap-1.5 text-[#10B981] text-xs font-bold uppercase tracking-wider mb-1">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  <span>Atención</span>
                </div>
                <p className="text-lg sm:text-xl font-black text-brand-textPrimary leading-tight">08 a 22 hs</p>
                <p className="text-xs text-brand-textSecondary">Lunes a Viernes</p>
              </div>
              <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-brand-surface border border-brand-border">
                <div className="flex items-center gap-1.5 text-brand-warning text-xs font-bold uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  <span>Sede</span>
                </div>
                <p className="text-lg sm:text-xl font-black text-brand-textPrimary leading-tight truncate">
                  {GYM_BRAND_CONFIG.contact.address}
                </p>
                <p className="text-xs text-brand-textSecondary">{GYM_BRAND_CONFIG.identity.city}</p>
              </div>
            </div>
          </div>

          {/* Columna derecha: Tarjeta visual destacada con acento superior */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl bg-brand-surface border border-brand-border border-t-4 border-t-brand-primary p-3 sm:p-4 shadow-2xl">
              <div className="relative aspect-[16/11] w-full rounded-2xl overflow-hidden bg-brand-bg">
                <Image
                  src={GYM_BRAND_CONFIG.assets.heroCover}
                  alt={`Instalaciones de ${GYM_BRAND_CONFIG.identity.name}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/90 via-transparent to-transparent" />
                <div className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-4 p-4 rounded-2xl bg-brand-surface/95 backdrop-blur-md border border-brand-border flex flex-wrap items-center justify-between gap-3 shadow-lg">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-primaryText">
                      {GYM_BRAND_CONFIG.identity.name}
                    </p>
                    <p className="text-sm sm:text-base font-extrabold text-brand-textPrimary">
                      {mainSchedule ? `${mainSchedule.days}: ${mainSchedule.hours}` : GYM_BRAND_CONFIG.contact.address}
                    </p>
                  </div>
                  <a
                    href="#instalaciones"
                    className="min-h-[48px] px-4 rounded-xl bg-brand-bg hover:bg-brand-surfaceHover border border-brand-border text-xs font-bold uppercase tracking-wider text-brand-textPrimary inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>Explorar sectores</span>
                    <ArrowRight className="w-3.5 h-3.5 text-brand-primaryText" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Banda inferior Bento de 4 pilares */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article
                key={pillar.title}
                className="p-6 rounded-2xl bg-brand-surface border border-brand-border border-t-2 border-t-brand-primary/70 hover:border-brand-primary/60 shadow-md transition-all flex flex-col gap-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="w-10 h-10 rounded-xl bg-brand-primary/15 text-brand-primaryText flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-bg border border-brand-border text-brand-textSecondary">
                    {pillar.tag}
                  </span>
                </div>
                <h2 className="text-base font-extrabold text-brand-textPrimary">{pillar.title}</h2>
                <p className="text-sm text-brand-textSecondary leading-relaxed">{pillar.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
