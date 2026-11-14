import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";

const NAV_LINKS = [
  { label: "Inicio", href: "#inicio" },
  { label: "Instalaciones", href: "#instalaciones" },
  { label: "Planes y Tarifas", href: "#planes" },
  { label: "Horarios", href: "#horarios" },
  { label: "Contacto", href: "#contacto" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-brand-bg/90 backdrop-blur-xl border-b border-brand-border shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      <div className="max-w-7xl mx-auto h-20 px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4">
        {/* Identidad y Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xl"
        >
          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-brand-surface border border-brand-border shadow-[0_0_20px_-4px_rgba(37,99,235,0.4)] flex items-center justify-center shrink-0 group-hover:border-brand-primary transition-colors">
            <Image
              src={GYM_BRAND_CONFIG.assets.logoMain}
              alt={GYM_BRAND_CONFIG.identity.name}
              width={44}
              height={44}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="flex items-center gap-1.5 text-base sm:text-lg font-extrabold tracking-tight text-brand-textPrimary uppercase leading-tight">
              {GYM_BRAND_CONFIG.identity.shortName}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-warning">
              {GYM_BRAND_CONFIG.identity.subdivision} • 2 Sedes
            </span>
          </div>
        </Link>

        {/* Navegación Central */}
        <nav
          aria-label="Navegación principal"
          className="hidden lg:flex items-center gap-1 px-2 py-1.5 bg-brand-surface border border-brand-border rounded-xl"
        >
          {NAV_LINKS.map((item, idx) => (
            <a
              key={item.href}
              href={item.href}
              className={
                idx === 0
                  ? "px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-brand-primary text-brand-textPrimary transition-colors"
                  : "px-3.5 py-1.5 rounded-lg text-sm font-medium text-brand-textSecondary hover:text-brand-textPrimary hover:bg-brand-surfaceHover transition-colors"
              }
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Acciones Derecha: Botón Login Superior Derecho */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 sm:px-5 py-2 rounded-xl bg-brand-primary hover:bg-brand-primaryHover hover:text-brand-bg text-brand-textPrimary text-xs sm:text-sm font-bold tracking-wide shadow-[0_0_20px_-4px_rgba(37,99,235,0.5)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg"
          >
            <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Login</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
