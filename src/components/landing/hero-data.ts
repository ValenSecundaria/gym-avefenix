import {
  Dumbbell,
  Flame,
  Gauge,
  ScanLine,
  type LucideIcon,
} from "lucide-react";

export interface PillarItem {
  code: string;
  title: string;
  description: string;
  tag: string;
  icon: LucideIcon;
}

export const PILLARS: PillarItem[] = [
  {
    code: "01",
    title: "Hierro Real & Peso Libre",
    description:
      "Jaulas olímpicas, barras calibradas, bancos de competencia y mancuernas pesadas para progresar carga semana a semana.",
    tag: "Fuerza Pura",
    icon: Dumbbell,
  },
  {
    code: "02",
    title: "Parque de Máquinas",
    description:
      "Línea completa de máquinas biomecánicas y torres de poleas en acero industrial para hipertrofia localizada y segura.",
    tag: "Musculación",
    icon: Gauge,
  },
  {
    code: "03",
    title: "Potencia & Metabolismo",
    description:
      "Sector de acondicionamiento físico, resistencia muscular y trabajo cardiovascular para un rendimiento atlético completo.",
    tag: "Acondicionamiento",
    icon: Flame,
  },
  {
    code: "04",
    title: "Terminal DNI sin Demoras",
    description:
      "Ingreso directo con tu documento en mostrador con verificación instantánea de cuota vigente y cupo semanal.",
    tag: "Control Ágil",
    icon: ScanLine,
  },
];
