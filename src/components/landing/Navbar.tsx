import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ShieldCheck } from "lucide-react";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";

const NAV_LINKS = [
  { label: "Inicio", href: "#inicio" },
  { label: "Espacios", href: "#instalaciones" },
  { label: "Planes", href: "#planes" },
  { label: "Horarios", href: "#horarios" },
  { label: "Ubicación", href: "#contacto" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-brand-bg/90 backdrop-blur-xl border-b border-brand-border/80">
      <div className="max-w-7xl mx-auto h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Identidad del gimnasio */}
        <Link
          href="/"
          className="flex items-center gap-3.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-2xl pr-2"
        >
          <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-brand-surface border border-brand-border group-hover:border-brand-primary/70 shadow-sm flex items-center justify-center shrink-0 transition-colors">
            <Image
              src={GYM_BRAND_CONFIG.assets.logoMain}
              alt={GYM_BRAND_CONFIG.identity.name}
              width={44}
              height={44}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-brand-textPrimary leading-tight truncate">
              {GYM_BRAND_CONFIG.identity.name}
            </span>
            <span className="text-xs text-brand-textSecondary inline-flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-3 h-3 text-brand-primaryText shrink-0" aria-hidden="true" />
              <span>{GYM_BRAND_CONFIG.contact.address} • {GYM_BRAND_CONFIG.identity.city}</span>
            </span>
          </div>
        </Link>

        {/* Cápsula central de navegación */}
        <nav
          aria-label="Navegación principal"
          className="hidden lg:flex items-center gap-1 p-1.5 rounded-full bg-brand-surface/90 border border-brand-border shadow-inner"
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-4 py-2 rounded-full text-sm font-semibold text-brand-textSecondary hover:text-brand-textPrimary hover:bg-brand-surfaceHover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Acceso / Login en esquina superior derecha */}
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-full bg-brand-primary hover:bg-brand-primaryHover text-white text-sm font-bold tracking-wide shadow-md shadow-brand-primary/25 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg shrink-0"
        >
          <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Acceso</span>
        </Link>
      </div>
    </header>
  );
}
