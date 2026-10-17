import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, MessageCircle, Clock, QrCode, ShieldCheck, Flame } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/utils";

const GYM_WHATSAPP = "5491154923810";

export function Footer() {
  const whatsappUrl = buildWhatsAppLink(
    GYM_WHATSAPP,
    "Hola Gimnasio Ave Fénix! Me gustaría recibir más información sobre horarios y planes."
  );

  return (
    <footer id="contacto" className="w-full bg-[#0B0B0C] border-t border-[#2C2D35] text-[#F4F5F7]">
      {/* Banner de Ubicación y Contacto Directo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-16 pb-12">
        <div className="rounded-2xl bg-[#17171C] border border-[#2C2D35] p-6 sm:p-8 lg:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B0B0C] border border-[#2C2D35] w-fit">
              <MapPin className="w-4 h-4 text-[#F95716]" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#FFB300]">Ubicación Estratégica</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F4F5F7] tracking-tight">
              Vení a Entrenar a Gimnasio Ave Fénix
            </h2>
            <p className="text-sm sm:text-base text-[#8A909A] max-w-xl leading-relaxed">
              Av. Corrientes 4520, Almagro, CABA (a 150m de Estación Ángel Gallardo - Subte B).
              Consultanos por WhatsApp o acercate directamente en horario de recepción.
            </p>
          </div>

          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#25D366]/90 text-[#0B0B0C] text-sm font-extrabold uppercase tracking-wider shadow-[0_0_20px_-4px_rgba(37,211,102,0.4)] transition-all"
            >
              <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>WhatsApp (+54 9 11 5492-3810)</span>
            </a>
            <Link
              href="/check-in"
              className="min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0B0B0C] hover:bg-[#23232A] text-[#F4F5F7] border border-[#2C2D35] text-sm font-semibold transition-colors"
            >
              <QrCode className="w-4 h-4 text-[#F95716]" aria-hidden="true" />
              <span>Abrir Monitor Público de Check-In</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Pie de Página Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 border-t border-[#2C2D35]/70">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#17171C] border border-[#2C2D35] shrink-0">
                <Image src="/Logo.jpeg" alt="Logo Gimnasio Ave Fénix" width={40} height={40} className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="flex items-center gap-1 text-base font-extrabold uppercase text-[#F4F5F7]">
                  Ave Fénix
                  <Flame className="w-4 h-4 text-[#F95716]" aria-hidden="true" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#FFB300]">By White</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#8A909A] leading-relaxed">
              Centro de alto rendimiento físico y transformación integral. Disciplina, fuego y acero guiados por profesionales.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FFB300] mb-1">Sede &amp; Horarios</span>
            <p className="text-[#F4F5F7] font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#F95716] shrink-0" aria-hidden="true" />
              Av. Corrientes 4520, Almagro
            </p>
            <p className="text-[#8A909A] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F95716] shrink-0" aria-hidden="true" />
              Lun a Vie: 08:00 – 22:00 hs
            </p>
            <p className="text-[#8A909A] pl-6">Sábados: 10:00 – 14:00 hs</p>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FFB300] mb-1">Secciones</span>
            <a href="#inicio" className="text-[#8A909A] hover:text-[#F4F5F7] transition-colors">Inicio y Equipamiento</a>
            <a href="#planes" className="text-[#8A909A] hover:text-[#F4F5F7] transition-colors">Planes y Tarifas</a>
            <a href="#horarios" className="text-[#8A909A] hover:text-[#F4F5F7] transition-colors">Horarios y Modalidades</a>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FFB300] mb-1">Sistema de Gestión</span>
            <Link href="/check-in" className="inline-flex items-center gap-2 text-[#8A909A] hover:text-[#F95716] transition-colors">
              <QrCode className="w-4 h-4 text-[#F95716]" aria-hidden="true" />
              Terminal de Ingreso (Socios)
            </Link>
            <Link href="/login" className="inline-flex items-center gap-2 text-[#8A909A] hover:text-[#F95716] transition-colors">
              <ShieldCheck className="w-4 h-4 text-[#F95716]" aria-hidden="true" />
              Panel de Recepción / Login
            </Link>
          </div>
        </div>

        <div className="pt-6 border-t border-[#2C2D35]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8A909A]">
          <p>© 2026 Gimnasio Ave Fénix — Sistema de Control de Acceso y Gestión.</p>
          <span className="uppercase tracking-widest font-semibold text-[#8A909A]">By White Architecture</span>
        </div>
      </div>
    </footer>
  );
}
