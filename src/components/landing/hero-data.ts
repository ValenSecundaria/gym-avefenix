import {
  Dumbbell,
  Award,
  ScanLine,
  Activity,
  HeartPulse,
  Shield,
  type LucideIcon,
} from "lucide-react";

export interface MetricItem {
  value: string;
  label: string;
  sub: string;
  icon: LucideIcon;
  accent: string;
}

export interface PillarItem {
  title: string;
  description: string;
  tag: string;
  icon: LucideIcon;
}

export const STATIC_METRICS: MetricItem[] = [
  {
    value: "Lun–Vie",
    label: "08:00 a 22:00 hs",
    sub: "Horario corrido semanal",
    icon: Dumbbell,
    accent: "text-brand-primaryText",
  },
  {
    value: "100%",
    label: "Guía Profesional",
    sub: "Seguimiento en sala",
    icon: Award,
    accent: "text-[#10B981]",
  },
  {
    value: "DNI Ágil",
    label: "Acceso Instantáneo",
    sub: "Terminal sin esperas",
    icon: ScanLine,
    accent: "text-brand-warning",
  },
];

export const PILLARS: PillarItem[] = [
  {
    title: "Musculación y Fuerza",
    description:
      "Peso libre, bancos y máquinas seleccionadas para ganar fuerza muscular cuidando la técnica en cada repetición.",
    tag: "Fuerza Progresiva",
    icon: Dumbbell,
  },
  {
    title: "Funcional & HIIT",
    description:
      "Circuitos dinámicos de alta intensidad pensados para mejorar resistencia, agilidad y capacidad metabólica.",
    tag: "Energía & Ritmo",
    icon: Activity,
  },
  {
    title: "Ejercicio y Salud Activa",
    description:
      "Planes adaptados a tu condición inicial, priorizando movilidad, bienestar articular y hábitos sostenibles.",
    tag: "Salud Integral",
    icon: HeartPulse,
  },
  {
    title: "Ingreso Rápido con DNI",
    description:
      "Registrá tu asistencia en segundos en recepción con control automático de vigencia y frecuencia semanal.",
    tag: "Sin Demoras",
    icon: Shield,
  },
];
