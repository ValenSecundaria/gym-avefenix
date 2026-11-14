import { Dumbbell, Flame, HeartPulse, Zap, type LucideIcon } from "lucide-react";

export interface ModalityItem {
  name: string;
  schedule: string;
  level: string;
  description: string;
  icon: LucideIcon;
  accent: string;
}

const STANDARD_SCHEDULE = "Lun a Vie 06:30–22:00 • Sáb 16:00–19:00";

export const MODALITIES: ModalityItem[] = [
  {
    name: "Sala de Musculación",
    schedule: STANDARD_SCHEDULE,
    level: "Fuerza e Hipertrofia",
    description: "Zona completa de peso libre, mancuernas, racks y maquinaria biomecánica guiada para sobrecarga progresiva con profesores capacitados en sala.",
    icon: Dumbbell,
    accent: "text-brand-primaryText",
  },
  {
    name: "Entrenamiento Funcional",
    schedule: STANDARD_SCHEDULE,
    level: "Acondicionamiento Físico",
    description: "Circuitos metabólicos y ejercicios multiarticulares orientados a potencia, agilidad, coordinación, core y resistencia cardiovascular.",
    icon: Flame,
    accent: "text-brand-warning",
  },
  {
    name: "Cardio",
    schedule: STANDARD_SCHEDULE,
    level: "Salud y Resistencia",
    description: "Cintas de alto rendimiento, bicicletas y sector aeróbico para maximizar la resistencia pulmonar y el gasto calórico.",
    icon: HeartPulse,
    accent: "text-[#10B981]",
  },
  {
    name: "Entrenamiento Híbrido",
    schedule: STANDARD_SCHEDULE,
    level: "Alto Rendimiento",
    description: "La sinergia ideal entre la fuerza y sobrecarga de la musculación con la intensidad metabólica del funcional para atletas integrales.",
    icon: Zap,
    accent: "text-brand-primaryText",
  },
];
