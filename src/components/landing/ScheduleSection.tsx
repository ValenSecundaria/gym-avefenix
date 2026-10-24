import React from "react";
import Link from "next/link";
import {
  Clock,
  Dumbbell,
  Flame,
  HeartPulse,
  Zap,
  QrCode,
  Info,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { buildWhatsAppLink } from "@/lib/utils";

const GYM_WHATSAPP = "5492915768403";

const MODALITIES = [
  {
    name: "Sala de Musculación",
    schedule: "Lun a Vie 08:00 – 22:00 • Sáb 10:00 – 14:00",
    level: "Fuerza e Hipertrofia",
    description: "Zona completa de peso libre, mancuernas, racks y maquinaria biomecánica guiada para sobrecarga progresiva con profesor en sala.",
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

const HOURS = [
  { day: "Lunes a Viernes", time: "08:00 a 22:00 hs", note: "Horario corrido", color: "text-[#F95716]" },
  { day: "Sábados", time: "10:00 a 14:00 hs", note: "Turno matutino", color: "text-[#FFB300]" },
  { day: "Domingos", time: "Cerrado", note: "Descanso muscular", color: "text-[#D92614]" },
];

export function ScheduleSection() {
  const waNovedadesLink = buildWhatsAppLink(
    GYM_WHATSAPP,
    "Hola Gimnasio Ave Fénix! Quiero consultar por las nuevas disciplinas y horarios."
  );

  return (
    <section id="horarios" className="w-full bg-[#0B0B0C] px-4 sm:px-6 lg:px-10 py-20 border-t border-[#2C2D35]/60">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#F95716]">
              Disciplinas y Turnos
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F4F5F7] tracking-tight mt-1">
              Horarios y Modalidades
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#8A909A] max-w-md">
            Entrená a tu ritmo en horario corrido de 08:00 a 22:00 hs en la semana y sábados de 10:00 a 14:00 hs.
          </p>
        </div>

        {/* Grilla de Disciplinas Oficiales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {MODALITIES.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.name}
                className="p-6 rounded-2xl bg-[#17171C] hover:bg-[#23232A] border border-[#2C2D35] flex flex-col justify-between transition-colors group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#0B0B0C] border border-[#2C2D35] flex items-center justify-center group-hover:border-[#F95716]/50 transition-colors">
                      <Icon className={`w-5 h-5 ${mod.accent}`} aria-hidden="true" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#0B0B0C] border border-[#2C2D35] text-[11px] font-semibold text-[#8A909A]">
                      {mod.level}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#F4F5F7] mb-2">{mod.name}</h3>
                  <p className="text-sm text-[#8A909A] leading-relaxed mb-4">{mod.description}</p>
                </div>
                <div className="pt-3 border-t border-[#2C2D35] text-xs font-semibold text-[#FFB300]">
                  {mod.schedule}
                </div>
              </div>
            );
          })}
        </div>

        {/* Notificación: Próximamente más disciplinas */}
        <div className="w-full flex items-center justify-between flex-wrap gap-4 p-4 sm:p-5 rounded-2xl bg-[#17171C] border border-[#2C2D35] border-dashed">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#0B0B0C] border border-[#2C2D35] flex items-center justify-center text-[#FFB300] shrink-0">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="text-sm font-bold text-[#F4F5F7] flex items-center gap-2">
                Próximamente más disciplinas...
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#FFB300]/15 text-[#FFB300] text-[10px] font-bold uppercase tracking-wider">
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
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FFB300] hover:text-[#F95716] transition-colors"
          >
            <span>Consultar novedades</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>

        {/* Tarjeta de Horarios de Apertura y Terminal */}
        <div className="rounded-2xl bg-[#17171C] border border-[#2C2D35] p-6 sm:p-8 lg:p-10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#0B0B0C] border border-[#2C2D35] flex items-center justify-center text-[#F95716]">
                <Clock className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#F95716]">
                  Sede Ingeniero White • Lautaro 3322
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#F4F5F7]">
                  Horarios de Apertura
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {HOURS.map((h) => (
                <div key={h.day} className="p-4 rounded-xl bg-[#0B0B0C] border border-[#2C2D35]">
                  <span className="text-xs uppercase font-bold text-[#8A909A]">{h.day}</span>
                  <p className={`text-lg font-extrabold mt-1 ${h.color}`}>{h.time}</p>
                  <span className="text-xs text-[#8A909A]">{h.note}</span>
                </div>
              ))}
            </div>
            <p className="text-xs sm:text-sm text-[#8A909A] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#F95716] shrink-0" aria-hidden="true" />
              <span>Recepción y profesores disponibles durante todo el horario de apertura.</span>
            </p>
          </div>

          <div className="lg:col-span-5 flex flex-col p-6 rounded-2xl bg-[#0B0B0C] border border-[#2C2D35]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8A909A]">Estado en Vivo</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] text-xs font-bold uppercase">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                Sede Operativa
              </span>
            </div>
            <div className="flex flex-col items-center text-center py-5 px-4 rounded-xl bg-[#17171C] border border-[#2C2D35] mb-4">
              <QrCode className="w-10 h-10 text-[#F95716] mb-2" aria-hidden="true" />
              <span className="text-sm font-bold uppercase tracking-wider text-[#F4F5F7]">Terminal de Autoconsulta Activa</span>
              <span className="text-xs text-[#8A909A] mt-0.5">Validación instantánea de ingreso con tu DNI</span>
            </div>
            <Link
              href="/check-in"
              className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#23232A] hover:bg-[#F95716] text-[#F4F5F7] text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors"
            >
              Ir a Terminal de Check-In
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
