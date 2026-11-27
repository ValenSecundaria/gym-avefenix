import { Dumbbell, Flame, Gauge, Zap, type LucideIcon } from "lucide-react";

export interface ModalityItem {
  name: string;
  schedule: string;
  level: string;
  description: string;
  icon: LucideIcon;
  accent: string;
}

const WEEK_SHIFTS = "Lun a Vie 07:30–11:30 / 19:00–23:00 • Sáb 19:00–21:00";

export const MODALITIES: ModalityItem[] = [
  {
    name: "Peso Libre & Fuerza Olímpica",
    schedule: WEEK_SHIFTS,
    level: "Sobrecarga Progresiva",
    description:
      "Racks de sentadilla, press plano e inclinado, peso muerto y mancuernas pesadas con seguimiento técnico en sala.",
    icon: Dumbbell,
    accent: "text-brand-primaryText",
  },
  {
    name: "Musculación en Máquinas",
    schedule: WEEK_SHIFTS,
    level: "Hipertrofia Guiada",
    description:
      "Equipamiento de acero guiado y estaciones de poleas para aislar cada grupo muscular con máxima estabilidad.",
    icon: Gauge,
    accent: "text-brand-primaryText",
  },
  {
    name: "Acondicionamiento & Potencia",
    schedule: WEEK_SHIFTS,
    level: "Capacidad Atlética",
    description:
      "Circuitos dinámicos de empuje, tracción, zona media y resistencia metabólica adaptados a tu nivel.",
    icon: Flame,
    accent: "text-brand-warning",
  },
  {
    name: "Cardio & Preparación Física",
    schedule: WEEK_SHIFTS,
    level: "Resistencia Aeróbica",
    description:
      "Cintas, bicicletas de aire y remos para entrada en calor, gasto calórico y salud cardiorrespiratoria.",
    icon: Zap,
    accent: "text-[#10B981]",
  },
];
