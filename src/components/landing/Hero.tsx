"use client";

import React from "react";
import {
  Flame,
  ArrowRight,
  MessageCircle,
  Dumbbell,
  Award,
  ScanLine,
  Users,
  Activity,
  ClipboardCheck,
  Shield,
} from "lucide-react";
import { useAuth } from "@/context/auth-session-context";
import { buildWhatsAppLink } from "@/lib/utils";

interface HeroProps {
  activeMembers?: number;
}

const STATIC_METRICS = [
  { value: "100% Pro", label: "Equipamiento Biomecánico", sub: "Línea Importada Calibrada", icon: Dumbbell, accent: "text-[#FFB300]" },
  { value: "Élite", label: "Entrenadores en Sala", sub: "Profesores Certificados", icon: Award, accent: "text-[#10B981]" },
  { value: "DNI Ágil", label: "Ingreso Automático", sub: "Molinete sin Demoras", icon: ScanLine, accent: "text-[#F95716]" },
];

const PILLARS = [
  {
    title: "Zona Musculación Pesada",
    description: "Racks olímpicos reglamentarios, mancuernas sólidas de hasta 50kg y discos calibrados para sobrecarga progresiva real.",
    tag: "Alto Impacto",
    icon: Dumbbell,
  },
  {
    title: "Sector Cardio & HIIT",
    description: "Cintas de alto rendimiento, remos de aire y bicicletas ergométricas diseñadas para optimizar capacidad pulmonar.",
    tag: "Resistencia Pura",
    icon: Activity,
  },
  {
    title: "Rutinas Personalizadas",
    description: "Planes orientados a hipertrofia, potencia explosiva o recomposición corporal, supervisados en sala.",
    tag: "Seguimiento Continuo",
    icon: ClipboardCheck,
  },
  {
    title: "Acceso Rápido y Seguro",
    description: "Terminales ágiles de ingreso por DNI en tiempo real para entrenar sin demoras ni filas en recepción.",
    tag: "Tecnología Ágil",
    icon: Shield,
  },
];

export function Hero({ activeMembers }: HeroProps) {
  const { user } = useAuth();
  const gymPhone = user?.gymPhone || "5492915768403";
  const whatsappUrl = buildWhatsAppLink(
    gymPhone,
    "Hola Gimnasio Ave Fénix! Quiero consultar para empezar a entrenar."
  );

  const activeMembersValue =
    typeof activeMembers === "number" ? String(activeMembers) : "0";

  const metrics = [
    {
      value: activeMembersValue,
      label: "Socios Activos",
      sub: "Comunidad activa con cuota al día",
      icon: Users,
      accent: "text-[#F95716]",
    },
    ...STATIC_METRICS,
  ];

  return (
    <section
      id="inicio"
      className="relative w-full overflow-hidden bg-[#0B0B0C] px-4 sm:px-6 lg:px-10 pt-14 pb-20 lg:pt-20 lg:pb-24"
    >
      <div aria-hidden="true" className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 w-[680px] h-[420px] rounded-full bg-[#F95716]/15 blur-[130px]" />
      <div aria-hidden="true" className="pointer-events-none absolute top-24 right-10 w-[280px] h-[280px] rounded-full bg-[#D92614]/10 blur-[100px]" />

      <div className="relative max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#17171C] border border-[#2C2D35] shadow-md mb-7">
          <Flame className="w-4 h-4 text-[#F95716]" aria-hidden="true" />
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#FFB300]">
            Entrenamiento de Fuerza y Rendimiento • Ingeniero White
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F4F5F7] max-w-4xl leading-[1.08] mb-4 uppercase">
          Forjá tu mejor versión.{" "}
          <span className="bg-gradient-to-r from-[#F95716] via-[#F95716] to-[#FFB300] bg-clip-text text-transparent">
            Renacé más fuerte en Ave Fénix
          </span>
        </h1>

        <p className="text-base sm:text-lg lg:text-xl text-[#8A909A] max-w-2xl mx-auto mb-10 leading-relaxed">
          Musculación, fuerza y entrenamiento personalizado en un ambiente pensado para superar tus
          límites. Equipamiento biomecánico de primer nivel y acompañamiento constante.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16">
          <a
            href="#planes"
            className="w-full sm:w-auto min-h-[52px] inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl bg-[#F95716] hover:bg-[#F95716]/90 text-[#F4F5F7] text-sm sm:text-base font-bold uppercase tracking-wider shadow-[0_0_28px_-4px_rgba(249,87,22,0.55)] transition-all"
          >
            <span>Empezar a Entrenar</span>
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto min-h-[52px] inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl bg-[#17171C] hover:bg-[#23232A] text-[#F4F5F7] border border-[#2C2D35] text-sm sm:text-base font-semibold uppercase tracking-wider transition-all"
          >
            <MessageCircle className="w-5 h-5 text-[#25D366]" aria-hidden="true" />
            <span>Consultar por WhatsApp</span>
          </a>
        </div>

        <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 sm:p-6 rounded-2xl bg-[#17171C] border border-[#2C2D35] shadow-xl mb-14">
          {metrics.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex flex-col items-center justify-center p-3">
                <Icon className={`w-6 h-6 mb-2 ${item.accent}`} aria-hidden="true" />
                <span className="text-2xl sm:text-3xl font-extrabold text-[#F4F5F7] tracking-tight">{item.value}</span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#F4F5F7] mt-1">{item.label}</span>
                <span className="text-xs text-[#8A909A] mt-0.5">{item.sub}</span>
              </div>
            );
          })}
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.title} className="p-6 rounded-2xl bg-[#17171C] hover:bg-[#23232A] border border-[#2C2D35] flex flex-col justify-between transition-colors group">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#0B0B0C] border border-[#2C2D35] flex items-center justify-center text-[#F95716] mb-4 group-hover:border-[#F95716]/50 transition-colors">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h2 className="text-lg font-bold text-[#F4F5F7] mb-2">{pillar.title}</h2>
                  <p className="text-sm text-[#8A909A] leading-relaxed">{pillar.description}</p>
                </div>
                <span className="mt-5 inline-flex items-center text-[11px] font-bold uppercase tracking-widest text-[#FFB300]">{pillar.tag}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
