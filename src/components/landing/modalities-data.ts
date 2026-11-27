import { Dumbbell, Flame, HeartPulse, Zap, type LucideIcon } from "lucide-react";

export interface ModalityItem {
  name: string;
  schedule: string;
  level: string;
  description: string;
  icon: LucideIcon;
  accent: string;
}

const STANDARD_SCHEDULE = "Lunes a Viernes • 08:00 a 22:00 hs";

export const MODALITIES: ModalityItem[] = [
  {
    name: "Sala de Musculación",
    schedule: STANDARD_SCHEDULE,
    level: "Fuerza y Tonificación",
    description:
      "Zona de peso libre, mancuernas, barras y equipamiento guiado para trabajar sobrecarga progresiva con acompañamiento docente.",
    icon: Dumbbell,
    accent: "text-brand-primaryText",
  },
  {
    name: "Funcional & HIIT",
    schedule: STANDARD_SCHEDULE,
    level: "Potencia y Metabolismo",
    description:
      "Circuitos intermitentes de alta intensidad para mejorar agilidad, coordinación, zona media y resistencia general.",
    icon: Flame,
    accent: "text-brand-warning",
  },
  {
    name: "Ejercicio y Salud Activa",
    schedule: STANDARD_SCHEDULE,
    level: "Bienestar Integral",
    description:
      "Rutinas adaptadas para fortalecer articulaciones, mejorar la postura corporal y sostener un estilo de vida saludable.",
    icon: HeartPulse,
    accent: "text-[#10B981]",
  },
  {
    name: "Acondicionamiento Aeróbico",
    schedule: STANDARD_SCHEDULE,
    level: "Capacidad Cardiorrespiratoria",
    description:
      "Trabajo cardiovascular complementario para entrada en calor, recuperación activa y salud cardíaca.",
    icon: Zap,
    accent: "text-brand-primaryText",
  },
];
