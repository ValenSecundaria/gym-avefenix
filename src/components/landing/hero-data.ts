import {
  Dumbbell,
  Award,
  ScanLine,
  Activity,
  ClipboardCheck,
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
  { value: "100% Pro", label: "Equipamiento Biomecánico", sub: "Línea Importada Calibrada", icon: Dumbbell, accent: "text-[#FFB300]" },
  { value: "Élite", label: "Entrenadores en Sala", sub: "Profesores Certificados y de Primer Nivel", icon: Award, accent: "text-[#10B981]" },
  { value: "DNI Ágil", label: "Ingreso Automático", sub: "Ingreso Rápido y Seguro", icon: ScanLine, accent: "text-[#F95716]" },
];

export const PILLARS: PillarItem[] = [
  {
    title: "Zona Musculación y Fuerza",
    description: "Equipamiento completo de peso libre, racks olímpicos y mancuernas de alto rendimiento para desarrollar fuerza y superar tus límites.",
    tag: "Entrenamiento de Fuerza",
    icon: Dumbbell,
  },
  {
    title: "Sector Cardio & HIIT",
    description: "Equipamiento aeróbico y entrenamiento de alta intensidad para mejorar tu resistencia, capacidad cardiovascular y rendimiento físico.",
    tag: "Resistencia y Rendimiento",
    icon: Activity,
  },
  {
    title: "Rutinas Personalizadas",
    description: "Planes de entrenamiento adaptados a tus objetivos, con acompañamiento y supervisión profesional en cada etapa.",
    tag: "Seguimiento Continuo",
    icon: ClipboardCheck,
  },
  {
    title: "Acceso Rápido y Seguro",
    description: "Ingresá fácilmente con tu DNI mediante un sistema de acceso ágil y seguro, sin demoras ni esperas.",
    tag: "Tecnología Ágil",
    icon: Shield,
  },
];
