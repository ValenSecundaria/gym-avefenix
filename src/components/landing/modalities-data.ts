import { Dumbbell, Flame, HeartPulse, Zap, type LucideIcon } from "lucide-react";

export interface ModalityItem {
  name: string;
  schedule: string;
  level: string;
  description: string;
  icon: LucideIcon;
  accent: string;
}

export const MODALITIES: ModalityItem[] = [
  {
    name: "Sala de Musculación",
    schedule: "Lun a Vie 08:00 – 22:00 • Sáb 10:00 – 14:00",
    level: "Fuerza e Hipertrofia",
    description: "Zona completa de peso libre, mancuernas, racks y maquinaria biomecánica guiada para sobrecarga progresiva con profesores capacitados en sala.",
    icon: Dumbbell,
    accent: "text-[#F95716]",
  },
  {
    name: "Entrenamiento Funcional",
    schedule: "Lun a Vie 08:00 – 22:00 • Sáb 10:00 – 14:00",
    level: "Acondicionamiento Físico",
    description: "Circuitos metabólicos y ejercicios multiarticulares orientados a potencia, agilidad, coordinación, core y resistencia cardiovascular.",
    icon: Flame,
    accent: "text-[#FFB300]",
  },
  {
    name: "Cardio",
    schedule: "Lun a Vie 08:00 – 22:00 • Sáb 10:00 – 14:00",
    level: "Salud y Resistencia",
    description: "Cintas de alto rendimiento, bicicletas y sector aeróbico para maximizar la resistencia pulmonar y el gasto calórico.",
    icon: HeartPulse,
    accent: "text-[#10B981]",
  },
  {
    name: "Entrenamiento Híbrido",
    schedule: "Lun a Vie 08:00 – 22:00 • Sáb 10:00 – 14:00",
    level: "Alto Rendimiento",
    description: "La sinergia ideal entre la fuerza y sobrecarga de la musculación con la intensidad metabólica del funcional para atletas integrales.",
    icon: Zap,
    accent: "text-[#F95716]",
  },
];
