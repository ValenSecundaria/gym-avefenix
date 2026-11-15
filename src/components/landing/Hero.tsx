"use client";

import React from "react";
import { Dumbbell, ArrowRight, MessageCircle, Users, MapPin } from "lucide-react";
import { useAuth } from "@/context/auth-session-context";
import { buildWhatsAppLink } from "@/lib/utils";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";
import { STATIC_METRICS, PILLARS } from "./hero-data";

interface HeroProps {
  activeMembers?: number;
}

export function Hero({ activeMembers }: HeroProps) {
  const { user } = useAuth();
  const gymPhone = user?.gymPhone || GYM_BRAND_CONFIG.contact.defaultWhatsapp;
  const whatsappUrl = buildWhatsAppLink(
    gymPhone,
    `Hola ${GYM_BRAND_CONFIG.identity.name}! Quiero consultar acerca del gimnasio para empezar a entrenar.`
  );

  const metrics = [
    {
      value: typeof activeMembers === "number" ? String(activeMembers) : "0",
      label: "Socios Activos",
      sub: "Cuota al día",
      icon: Users,
      accent: "text-brand-primaryText",
    },
    ...STATIC_METRICS,
  ];

  return (
    <section
      id="inicio"
      className="relative w-full overflow-hidden bg-[#0B0B0C] px-4 sm:px-6 lg:px-10 pt-12 pb-16 lg:pt-16 lg:pb-20 border-b-2 border-[#2C2D35]"
    >
      <div className="relative max-w-7xl mx-auto flex flex-col gap-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-md bg-[#17171C] border border-[#2C2D35] border-l-4 border-l-brand-primary mb-6">
              <Dumbbell className="w-4 h-4 text-brand-primaryText" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#F4F5F7]">
                {GYM_BRAND_CONFIG.identity.heroSubtitle}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#F4F5F7] leading-[1.04] mb-5 uppercase">
              Entrenamiento real.{" "}
              <span className="text-brand-primaryText">
                {GYM_BRAND_CONFIG.identity.heroTitle}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#A1A1AA] max-w-2xl mb-8 leading-relaxed">
              Entrena con nosotros, desarrollá tu potencial y alcanzá tus objetivos en un espacio diseñado para acompañar tu evolución.
              Equipamiento de primer nivel y asesoramiento personalizado en cada sesión.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              <a
                href="#planes"
                className="min-h-[52px] inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-lg bg-brand-primary hover:bg-brand-primaryHover text-white text-sm sm:text-base font-bold uppercase tracking-wider transition-colors"
              >
                <span>Comenzar a Entrenar</span>
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[52px] inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-lg bg-[#17171C] hover:bg-[#23232A] text-[#F4F5F7] border-2 border-[#2C2D35] text-sm sm:text-base font-semibold uppercase tracking-wider transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-[#25D366]" aria-hidden="true" />
                <span>Consultar por WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-lg bg-[#17171C] border-2 border-[#2C2D35] border-t-4 border-t-brand-primary p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center gap-4 pb-4 border-b border-[#2C2D35]">
              <img
                src={GYM_BRAND_CONFIG.assets.logoMain}
                alt={GYM_BRAND_CONFIG.identity.name}
                className="h-14 w-auto object-contain rounded-md bg-[#0B0B0C] p-1.5 border border-[#2C2D35]"
              />
              <div className="min-w-0">
                <p className="text-lg font-black uppercase tracking-tight text-[#F4F5F7] truncate">
                  {GYM_BRAND_CONFIG.identity.name}
                </p>
                <p className="text-xs text-[#A1A1AA] flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-primaryText shrink-0" aria-hidden="true" />
                  <span className="truncate">{GYM_BRAND_CONFIG.contact.address}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {metrics.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="p-3.5 rounded-md bg-[#0B0B0C] border border-[#2C2D35] flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-[#F4F5F7] tabular-nums">{item.value}</span>
                      <Icon className={`w-4 h-4 ${item.accent}`} aria-hidden="true" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#F4F5F7]">{item.label}</span>
                    <span className="text-[11px] text-[#8A909A]">{item.sub}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="p-5 rounded-lg bg-[#17171C] hover:bg-[#1E1E24] border-2 border-[#2C2D35] border-l-4 border-l-brand-primary flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-md bg-[#0B0B0C] border border-[#2C2D35] flex items-center justify-center text-brand-primaryText">
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA]">{pillar.tag}</span>
                  </div>
                  <h2 className="text-base font-extrabold uppercase tracking-tight text-[#F4F5F7] mb-1.5">{pillar.title}</h2>
                  <p className="text-sm text-[#8A909A] leading-relaxed">{pillar.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
