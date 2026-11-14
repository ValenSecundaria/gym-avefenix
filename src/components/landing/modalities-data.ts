import { Dumbbell, Activity, HeartPulse, Zap, type LucideIcon } from "lucide-react";

export interface ModalityItem {
  name: string;
  schedule: string;
  level: string;
  description: string;
  icon: LucideIcon;
  accent: string;
}

const PALESTRA_SCHEDULE = "L-M-V 07:00–21:00 • M-J 08:00–21:00 • Sáb 10:00–13:00";

export const MODALITIES: ModalityItem[] = [
  {
    name: "Sala de Musculación",
    schedule: PALESTRA_SCHEDULE,
    level: "Fuerza e Hipertrofia",
    description: "Zona completa de peso libre, mancuernas, racks y maquinaria biomecánica guiada para sobrecarga progresiva con profesores capacitados en sala.",
    icon: Dumbbell,
    accent: "text-brand-primaryText",
  },
  {
    name: "Entrenamiento Funcional",
    schedule: PALESTRA_SCHEDULE,
    level: "Acondicionamiento Físico",
    description: "Circuitos metabólicos y ejercicios multiarticulares orientados a potencia, agilidad, coordinación, core y resistencia cardiovascular.",
    icon: Activity,
    accent: "text-[#FFB300]",
  },
  {
    name: "Cardio",
    schedule: PALESTRA_SCHEDULE,
    level: "Salud y Resistencia",
    description: "Cintas de alto rendimiento, bicicletas y sector aeróbico para maximizar la resistencia pulmonar y el gasto calórico.",
    icon: HeartPulse,
    accent: "text-[#10B981]",
  },
  {
    name: "Entrenamiento Híbrido",
    schedule: PALESTRA_SCHEDULE,
    level: "Alto Rendimiento",
    description: "La sinergia ideal entre la fuerza y sobrecarga de la musculación con la intensidad metabólica del funcional para atletas integrales.",
    icon: Zap,
    accent: "text-brand-primaryText",
  },
];
