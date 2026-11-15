"use client";

import React from "react";
import { Clock, QrCode, Info, Sparkles, ArrowRight } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/utils";
import { useAuth } from "@/context/auth-session-context";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";
import { MODALITIES } from "./modalities-data";

export function ScheduleSection() {
  const { user } = useAuth();
  const gymPhone = user?.gymPhone || GYM_BRAND_CONFIG.contact.defaultWhatsapp;
  const waNovedadesLink = buildWhatsAppLink(
    gymPhone,
    `Hola ${GYM_BRAND_CONFIG.identity.name}! Quiero consultar por las nuevas disciplinas y horarios.`
  );

  return (
    <section id="horarios" className="w-full bg-[#0B0B0C] px-4 sm:px-6 lg:px-10 py-16 border-t-2 border-[#2C2D35]">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-l-4 border-l-brand-primary pl-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand-primaryText">Disciplinas y Turnos</span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#F4F5F7] mt-1">Horarios y Modalidades</h2>
          </div>
          <p className="text-sm sm:text-base text-[#8A909A] max-w-md">
            Entrená a tu ritmo en horario corrido durante la semana y los fines de semana.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MODALITIES.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.name}
                className="p-5 rounded-lg bg-[#17171C] hover:bg-[#1E1E24] border-2 border-[#2C2D35] border-t-4 border-t-brand-primary flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div className="w-9 h-9 rounded-md bg-[#0B0B0C] border border-[#2C2D35] flex items-center justify-center">
                      <Icon className={`w-4 h-4 ${mod.accent}`} aria-hidden="true" />
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-[#0B0B0C] border border-[#2C2D35] text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                      {mod.level}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold uppercase tracking-tight text-[#F4F5F7] mb-1.5">{mod.name}</h3>
                  <p className="text-sm text-[#8A909A] leading-relaxed mb-4">{mod.description}</p>
                </div>
                <div className="pt-3 border-t border-[#2C2D35] text-xs font-bold uppercase tracking-wider text-brand-primaryText">
                  {mod.schedule}
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-full flex items-center justify-between flex-wrap gap-4 p-4 sm:p-5 rounded-lg bg-[#17171C] border-2 border-dashed border-[#2C2D35]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-md bg-[#0B0B0C] border border-[#2C2D35] flex items-center justify-center text-brand-primaryText shrink-0">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="text-sm font-bold uppercase tracking-wide text-[#F4F5F7] flex items-center gap-2">
                Próximamente más disciplinas...
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-brand-primary/15 text-brand-primaryText text-[10px] font-bold uppercase tracking-wider">
                  En expansión
                </span>
              </span>
              <p className="text-xs text-[#8A909A] mt-0.5">
                Seguimos incorporando nuevas actividades y espacios para brindarte el entrenamiento más completo.
              </p>
            </div>
          </div>
          <a
            href={waNovedadesLink}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] inline-flex items-center gap-2 px-4 rounded-md bg-[#0B0B0C] border border-[#2C2D35] text-xs font-bold uppercase tracking-wider text-brand-primaryText hover:border-brand-primary transition-colors"
          >
            <span>Consultar novedades</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>

        <div className="rounded-lg bg-[#17171C] border-2 border-[#2C2D35] p-6 sm:p-8 shadow-2xl">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-7 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-md bg-[#0B0B0C] border border-[#2C2D35] flex items-center justify-center text-brand-primaryText">
                  <Clock className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-primaryText">
                    Sede {GYM_BRAND_CONFIG.identity.subdivision} • {GYM_BRAND_CONFIG.contact.address}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#F4F5F7]">Horarios de Apertura</h3>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GYM_BRAND_CONFIG.contact.schedule.map((h, i) => (
                  <div key={h.days} className="p-4 rounded-md bg-[#0B0B0C] border border-[#2C2D35] border-l-4 border-l-brand-primary">
                    <span className="text-xs uppercase font-bold text-[#8A909A]">{h.days}</span>
                    <p
                      className={`text-lg font-extrabold mt-1 ${
                        h.hours.toLowerCase().includes("cerrado")
                          ? "text-brand-alertText"
                          : i < 2
                            ? "text-brand-primaryText"
                            : "text-[#F4F5F7]"
                      }`}
                    >
                      {h.hours}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#8A909A] flex items-center gap-2">
                <Info className="w-4 h-4 text-brand-primaryText shrink-0" aria-hidden="true" />
                <span>Recepción y profesores disponibles durante todo el horario de apertura.</span>
              </p>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-md bg-[#0B0B0C] border-2 border-[#2C2D35]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8A909A]">Estado en Vivo</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#10B981]/15 text-[#10B981] text-xs font-bold uppercase">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  Sede Operativa
                </span>
              </div>
              <div className="flex flex-col items-center text-center py-6 px-4 rounded-md bg-[#17171C] border border-[#2C2D35]">
                <QrCode className="w-10 h-10 text-brand-primaryText mb-2" aria-hidden="true" />
                <span className="text-sm font-bold uppercase tracking-wider text-[#F4F5F7]">Terminal de Autoconsulta Activa</span>
                <span className="text-xs text-[#8A909A] mt-1 leading-relaxed">
                  Validación instantánea de ingreso con tu DNI directamente en el molinete de recepción.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
