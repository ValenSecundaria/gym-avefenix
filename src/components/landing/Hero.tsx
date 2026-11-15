"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, ArrowDownRight, ShieldCheck, Dumbbell, Users } from "lucide-react";
import { useAuth } from "@/context/auth-session-context";
import { buildWhatsAppLink } from "@/lib/utils";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";
import { STATIC_METRICS, PILLARS } from "./hero-data";
import { MagneticTiltCard } from "./MagneticTiltCard";

interface HeroProps {
  activeMembers?: number;
}

export function Hero({ activeMembers }: HeroProps) {
  const { user } = useAuth();
  const sectionRef = useRef<HTMLElement | null>(null);
  const gymPhone = user?.gymPhone || GYM_BRAND_CONFIG.contact.defaultWhatsapp;
  const whatsappUrl = buildWhatsAppLink(
    gymPhone,
    GYM_BRAND_CONFIG.messages.generalInquiry()
  );
  const showcaseImage = GYM_BRAND_CONFIG.assets.heroCover;
  const activeMembersValue = typeof activeMembers === "number" ? String(activeMembers) : "0";

  const metrics = [
    { value: activeMembersValue, label: "Socios Activos", icon: Users },
    ...STATIC_METRICS.slice(0, 2),
  ];

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse" || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    sectionRef.current.style.setProperty("--mx", `${(e.clientX - rect.left).toFixed(1)}px`);
    sectionRef.current.style.setProperty("--my", `${(e.clientY - rect.top).toFixed(1)}px`);
    sectionRef.current.style.setProperty("--grid-glow", "1");
  };

  const handlePointerLeave = () => {
    sectionRef.current?.style.setProperty("--grid-glow", "0");
  };

  return (
    <section
      ref={sectionRef}
      id="inicio"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative min-h-[88vh] flex items-center pt-24 pb-14 px-4 sm:px-6 overflow-hidden bg-brand-bg border-b border-brand-border"
    >
      {/* Fondo industrial sutil con grilla técnica */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--brand-border) 1px, transparent 1px), linear-gradient(to bottom, var(--brand-border) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Grilla reactiva al movimiento del mouse */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          opacity: "var(--grid-glow, 0)",
          transition: "opacity 350ms ease",
          backgroundImage:
            "linear-gradient(to right, color-mix(in srgb, var(--brand-primary) 45%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--brand-primary) 45%, transparent) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(340px circle at var(--mx, 50%) var(--my, 40%), black, transparent 75%)",
          WebkitMaskImage: "radial-gradient(340px circle at var(--mx, 50%) var(--my, 40%), black, transparent 75%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-brand-primary/10 blur-[120px]"
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Columna izquierda: Tipografía asimétrica y acciones */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-md border border-brand-border bg-brand-surface text-xs font-extrabold uppercase tracking-[0.18em] text-brand-primaryText mb-6">
            <span className="w-2 h-2 rounded-sm bg-brand-primary" />
            <span>{GYM_BRAND_CONFIG.identity.name} · {GYM_BRAND_CONFIG.contact.address}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-textPrimary leading-[1.03] tracking-tight uppercase mb-5">
            {GYM_BRAND_CONFIG.identity.heroTitle}
          </h1>

          <div className="w-20 h-1.5 bg-brand-primary rounded-sm mb-6" />

          <p className="text-base sm:text-lg text-brand-textSecondary max-w-2xl mb-8 leading-relaxed">
            {GYM_BRAND_CONFIG.identity.heroSubtitle}
          </p>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mb-9">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[52px] px-6 rounded-lg bg-brand-primary hover:bg-brand-primaryHover text-white font-extrabold text-sm sm:text-base uppercase tracking-wide inline-flex items-center justify-center gap-2.5 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Empezar hoy por WhatsApp</span>
            </a>

            <a
              href="#instalaciones"
              className="min-h-[52px] px-5 rounded-lg border border-brand-border bg-brand-surface hover:bg-brand-surface/80 text-brand-textPrimary font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 transition-colors"
            >
              <span>Ver instalaciones</span>
              <ArrowDownRight className="w-4 h-4 text-brand-primaryText" />
            </a>

            {user && (
              <Link
                href={user.role === "ADMIN" ? "/admin" : "/profesor"}
                className="min-h-[52px] px-5 rounded-lg border border-brand-primary/50 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primaryText font-bold text-sm inline-flex items-center gap-2 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Mi Panel ({user.name})</span>
              </Link>
            )}
          </div>

          {/* Barra de métricas técnicas */}
          <div className="w-full grid grid-cols-3 border border-brand-border rounded-lg bg-brand-surface/90 divide-x divide-brand-border overflow-hidden">
            {metrics.map((m) => (
              <div key={m.label} className="p-3.5 sm:p-4 flex flex-col">
                <span className="text-xl sm:text-2xl font-black font-mono text-brand-textPrimary leading-none mb-1.5">
                  {m.value}
                </span>
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brand-textSecondary">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Columna derecha: Tarjeta visual destacada + Pilares */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="relative rounded-lg border-2 border-brand-border bg-brand-surface overflow-hidden shadow-2xl">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={showcaseImage}
                alt={`Instalaciones de ${GYM_BRAND_CONFIG.identity.name}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/90 via-brand-bg/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-md bg-brand-bg/85 backdrop-blur-sm border border-brand-border">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-brand-primaryText shrink-0" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-brand-textPrimary">
                    {GYM_BRAND_CONFIG.contact.schedule[0]?.days}: {GYM_BRAND_CONFIG.contact.schedule[0]?.hours}
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-brand-primaryText uppercase">
                  {GYM_BRAND_CONFIG.identity.city}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <MagneticTiltCard
                  key={pillar.title}
                  className="p-3.5 rounded-lg border border-brand-border bg-brand-surface hover:border-brand-primary/50"
                >
                  <div className="flex items-center gap-2 text-brand-primaryText mb-1">
                    <Icon className="w-4 h-4 shrink-0" />
                    <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-brand-textPrimary">
                      {pillar.title}
                    </h2>
                  </div>
                  <p className="text-xs text-brand-textSecondary leading-snug line-clamp-3">
                    {pillar.description}
                  </p>
                </MagneticTiltCard>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
