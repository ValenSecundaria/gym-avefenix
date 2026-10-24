import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  MessageCircle,
  Clock,
  QrCode,
  ShieldCheck,
  Flame,
  ExternalLink,
} from "lucide-react";
import { buildWhatsAppLink } from "@/lib/utils";

const GYM_WHATSAPP = "5492915768403";
const GYM_PHONE_DISPLAY = "+54 9 291 5768403";
const INSTAGRAM_URL = "https://www.instagram.com/avefenix.gimnasio/";
const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61589622244223";
const ADDRESS_TEXT = "Lautaro 3322, Ingeniero White";
const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Lautaro+3322,+Ingeniero+White";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

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
              <span className="text-xs font-bold uppercase tracking-wider text-[#FFB300]">
                Ubicación Oficial
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F4F5F7] tracking-tight">
              Vení a Entrenar a Gimnasio Ave Fénix
            </h2>
            <p className="text-sm sm:text-base text-[#8A909A] max-w-xl leading-relaxed">
              {ADDRESS_TEXT}. Consultanos por WhatsApp o acercate directamente en nuestro horario de atención: de lunes a viernes de 8 a 22 hs y sábados de 10 a 14 hs.
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
              <span>WhatsApp ({GYM_PHONE_DISPLAY})</span>
            </a>
            <div className="flex gap-2">
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-h-[48px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0B0B0C] hover:bg-[#23232A] text-[#F4F5F7] border border-[#2C2D35] hover:border-[#FFB300]/50 text-xs sm:text-sm font-semibold transition-colors"
              >
                <MapPin className="w-4 h-4 text-[#FFB300] shrink-0" aria-hidden="true" />
                <span>Cómo Llegar</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#8A909A]" aria-hidden="true" />
              </a>
              <Link
                href="/check-in"
                className="flex-1 min-h-[48px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0B0B0C] hover:bg-[#23232A] text-[#F4F5F7] border border-[#2C2D35] hover:border-[#F95716]/50 text-xs sm:text-sm font-semibold transition-colors"
              >
                <QrCode className="w-4 h-4 text-[#F95716] shrink-0" aria-hidden="true" />
                <span>Check-In</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Pie de Página Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 border-t border-[#2C2D35]/70">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10">
          {/* Columna 1: Identidad y Redes */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#17171C] border border-[#2C2D35] shrink-0">
                <Image
                  src="/Logo.jpeg"
                  alt="Logo Gimnasio Ave Fénix"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="flex items-center gap-1 text-base font-extrabold uppercase text-[#F4F5F7]">
                  Ave Fénix
                  <Flame className="w-4 h-4 text-[#F95716]" aria-hidden="true" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#FFB300]">
                  By White
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#8A909A] leading-relaxed">
              Centro de alto rendimiento físico y transformación integral en Ingeniero White. Disciplina, fuego y acero guiados por profesionales.
            </p>
            {/* Botones de Redes Sociales */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[#17171C] hover:bg-[#23232A] border border-[#2C2D35] hover:border-[#E1306C] text-[#8A909A] hover:text-[#E1306C] flex items-center justify-center transition-colors shadow-sm"
                title="Instagram Oficial: @avefenix.gimnasio"
                aria-label="Instagram de Gimnasio Ave Fénix"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[#17171C] hover:bg-[#23232A] border border-[#2C2D35] hover:border-[#1877F2] text-[#8A909A] hover:text-[#1877F2] flex items-center justify-center transition-colors shadow-sm"
                title="Facebook Oficial: Ave Fénix"
                aria-label="Facebook de Gimnasio Ave Fénix"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[#17171C] hover:bg-[#23232A] border border-[#2C2D35] hover:border-[#25D366] text-[#8A909A] hover:text-[#25D366] flex items-center justify-center transition-colors shadow-sm"
                title="WhatsApp Oficial"
                aria-label="WhatsApp de Gimnasio Ave Fénix"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Columna 2: Sede y Horarios */}
          <div className="flex flex-col gap-2.5 text-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FFB300] mb-1">
              Sede &amp; Horarios
            </span>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F4F5F7] font-medium flex items-center gap-2 hover:text-[#FFB300] transition-colors"
            >
              <MapPin className="w-4 h-4 text-[#F95716] shrink-0" aria-hidden="true" />
              <span>{ADDRESS_TEXT}</span>
            </a>
            <p className="text-[#8A909A] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F95716] shrink-0" aria-hidden="true" />
              <span>Lun a Vie: 08:00 – 22:00 hs</span>
            </p>
            <p className="text-[#8A909A] pl-6">Sábados: 10:00 – 14:00 hs</p>
            <p className="text-[#8A909A] pl-6 text-xs text-[#D92614]">Domingos: Cerrado</p>
          </div>

          {/* Columna 3: Redes y Contacto Oficial */}
          <div className="flex flex-col gap-2.5 text-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FFB300] mb-1">
              Redes y Contacto
            </span>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-[#8A909A] hover:text-[#F4F5F7] transition-colors group"
            >
              <InstagramIcon className="w-4 h-4 text-[#F95716] group-hover:text-[#E1306C] transition-colors" />
              <span>@avefenix.gimnasio</span>
            </a>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-[#8A909A] hover:text-[#F4F5F7] transition-colors group"
            >
              <FacebookIcon className="w-4 h-4 text-[#F95716] group-hover:text-[#1877F2] transition-colors" />
              <span>Gimnasio Ave Fénix</span>
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-[#8A909A] hover:text-[#25D366] transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" aria-hidden="true" />
              <span>{GYM_PHONE_DISPLAY}</span>
            </a>
          </div>

          {/* Columna 4: Navegación y Acceso */}
          <div className="flex flex-col gap-2.5 text-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FFB300] mb-1">
              Sistema de Gestión
            </span>
            <Link
              href="/check-in"
              className="inline-flex items-center gap-2 text-[#8A909A] hover:text-[#F95716] transition-colors"
            >
              <QrCode className="w-4 h-4 text-[#F95716]" aria-hidden="true" />
              Terminal de Ingreso (Socios)
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[#8A909A] hover:text-[#F95716] transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-[#F95716]" aria-hidden="true" />
              Panel de Recepción / Login
            </Link>
            <div className="pt-2 flex flex-col gap-1 text-xs text-[#8A909A]">
              <a href="#inicio" className="hover:text-[#F4F5F7] transition-colors">
                • Inicio y Disciplinas
              </a>
              <a href="#planes" className="hover:text-[#F4F5F7] transition-colors">
                • Planes y Tarifas Oficiales
              </a>
              <a href="#horarios" className="hover:text-[#F4F5F7] transition-colors">
                • Horarios y Ubicación
              </a>
            </div>
          </div>
        </div>

        {/* Barra Inferior */}
        <div className="pt-6 border-t border-[#2C2D35]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8A909A]">
          <p>© 2026 Gimnasio Ave Fénix — {ADDRESS_TEXT}.</p>
          <span className="uppercase tracking-widest font-semibold text-[#8A909A]">
            By White Architecture
          </span>
        </div>

        {/* Créditos de Desarrollo */}
        <div className="pt-4 text-center">
          <p className="text-xs text-[#8A909A]/80 tracking-wide">
            Hecho con amor por Valentin Gemetro y Francisco Uyua ❤️
          </p>
        </div>
      </div>
    </footer>
  );
}
