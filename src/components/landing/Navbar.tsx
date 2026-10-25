import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, QrCode, Flame } from "lucide-react";

const NAV_LINKS = [
  { label: "Inicio", href: "#inicio" },
  { label: "Planes y Tarifas", href: "#planes" },
  { label: "Horarios", href: "#horarios" },
  { label: "Contacto", href: "#contacto" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B0B0C]/90 backdrop-blur-xl border-b border-[#2C2D35] shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      <div className="max-w-7xl mx-auto h-20 px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4">
        {/* Identidad y Logo Ave Fénix */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F95716] rounded-xl"
        >
          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-[#17171C] border border-[#2C2D35] shadow-[0_0_20px_-4px_rgba(249,87,22,0.4)] flex items-center justify-center shrink-0 group-hover:border-[#F95716] transition-colors">
            <Image
              src="/Logo.jpeg"
              alt="Logo Gimnasio Ave Fénix"
              width={44}
              height={44}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="flex items-center gap-1.5 text-base sm:text-lg font-extrabold tracking-tight text-[#F4F5F7] uppercase leading-tight">
              Ave Fénix
              <Flame className="w-4 h-4 text-[#F95716] hidden sm:inline" aria-hidden="true" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#FFB300]">
              By White • Sede Central
            </span>
          </div>
        </Link>

        {/* Navegación Central */}
        <nav
          aria-label="Navegación principal"
          className="hidden lg:flex items-center gap-1 px-2 py-1.5 bg-[#17171C] border border-[#2C2D35] rounded-xl"
        >
          {NAV_LINKS.map((item, idx) => (
            <a
              key={item.href}
              href={item.href}
              className={
                idx === 0
                  ? "px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-[#F95716] text-[#F4F5F7] transition-colors"
                  : "px-3.5 py-1.5 rounded-lg text-sm font-medium text-[#8A909A] hover:text-[#F4F5F7] hover:bg-[#23232A] transition-colors"
              }
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Acciones Derecha: Terminal Check-In + Botón Login Superior Derecho */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/check-in"
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-3.5 sm:px-4 py-2 rounded-xl bg-[#17171C] hover:bg-[#23232A] text-[#F4F5F7] border border-[#2C2D35] hover:border-[#FFB300]/50 text-xs sm:text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F95716]"
            title="Abrir monitor público de ingreso por DNI"
          >
            <QrCode className="w-4 h-4 text-[#FFB300] shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Terminal Check-In</span>
            <span className="sm:hidden">Check-In</span>
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 sm:px-5 py-2 rounded-xl bg-[#F95716] hover:bg-[#F95716]/90 text-[#F4F5F7] text-xs sm:text-sm font-bold tracking-wide shadow-[0_0_20px_-4px_rgba(249,87,22,0.5)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F95716] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0C]"
          >
            <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Login</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
