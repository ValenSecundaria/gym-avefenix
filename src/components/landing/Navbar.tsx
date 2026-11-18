import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";

const NAV_LINKS = [
  { num: "01", label: "Inicio", href: "#inicio" },
  { num: "02", label: "Espacios", href: "#instalaciones" },
  { num: "03", label: "Planes", href: "#planes" },
  { num: "04", label: "Horarios", href: "#horarios" },
  { num: "05", label: "Contacto", href: "#contacto" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full px-3 sm:px-6 pt-3 pointer-events-none">
      <div className="pointer-events-auto max-w-7xl mx-auto h-[72px] px-4 sm:px-5 rounded-lg bg-brand-bg/90 backdrop-blur-xl border-2 border-brand-border shadow-2xl flex items-center justify-between gap-4">
        {/* Identidad con acento lateral industrial */}
        <Link
          href="/"
          className="flex items-center gap-3 pl-2.5 border-l-4 border-brand-primary group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-sm"
        >
          <div className="relative w-10 h-10 rounded-md overflow-hidden bg-brand-surface border border-brand-border flex items-center justify-center shrink-0 group-hover:border-brand-primary transition-colors">
            <Image
              src={GYM_BRAND_CONFIG.assets.logoMain}
              alt={GYM_BRAND_CONFIG.identity.name}
              width={40}
              height={40}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-black tracking-tight text-brand-textPrimary uppercase leading-none">
              {GYM_BRAND_CONFIG.identity.shortName}
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-brand-primaryText mt-1">
              {GYM_BRAND_CONFIG.identity.subdivision}
            </span>
          </div>
        </Link>

        {/* Navegación numerada estilo técnico */}
        <nav aria-label="Navegación principal" className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group px-3 py-2 rounded-md text-xs font-extrabold uppercase tracking-wider text-brand-textSecondary hover:text-brand-textPrimary hover:bg-brand-surface transition-colors inline-flex items-center gap-1.5"
            >
              <span className="font-mono text-[10px] text-brand-primaryText opacity-75 group-hover:opacity-100">
                {item.num}
              </span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        {/* Botón Login superior derecho */}
        <Link
          href="/login"
          className="group relative inline-flex items-center justify-center gap-2 min-h-[48px] px-4 sm:px-5 rounded-full bg-brand-surface/90 hover:bg-brand-primary/15 border border-brand-primary/50 hover:border-brand-primary text-brand-textPrimary text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-sm hover:shadow-[0_0_18px_-3px_var(--color-brand-primary,#ef4444)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <ShieldCheck
            className="w-4 h-4 shrink-0 text-brand-primary transition-transform duration-200 group-hover:scale-110"
            aria-hidden="true"
          />
          <span>Login</span>
        </Link>
      </div>
    </header>
  );
}
