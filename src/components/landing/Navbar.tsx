import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ShieldCheck } from "lucide-react";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";

const NAV_LINKS = [
  { label: "Inicio", href: "#inicio" },
  { label: "Instalaciones", href: "#instalaciones" },
  { label: "Planes", href: "#planes" },
  { label: "Horarios", href: "#horarios" },
  { label: "Ubicación", href: "#contacto" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-brand-bg/95 backdrop-blur-md border-b-2 border-brand-primary/85">
      <div className="max-w-7xl mx-auto h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-3.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-md pr-2"
        >
          <div className="relative w-12 h-12 rounded-md overflow-hidden bg-brand-surface border-2 border-brand-border group-hover:border-brand-primary flex items-center justify-center shrink-0 transition-colors">
            <Image
              src={GYM_BRAND_CONFIG.assets.logoMain}
              alt={GYM_BRAND_CONFIG.identity.name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-base sm:text-lg font-black uppercase tracking-wider text-brand-textPrimary leading-none truncate">
              {GYM_BRAND_CONFIG.identity.name}
            </span>
            <span className="font-mono text-[11px] sm:text-xs text-brand-textSecondary inline-flex items-center gap-1 mt-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-brand-primaryText shrink-0" aria-hidden="true" />
              <span>{GYM_BRAND_CONFIG.contact.address} {"//"} {GYM_BRAND_CONFIG.identity.city}</span>
            </span>
          </div>
        </Link>

        <nav
          aria-label="Navegación principal"
          className="hidden lg:flex items-center bg-brand-surface border border-brand-border rounded-md px-2 py-1"
        >
          {NAV_LINKS.map((item, idx) => (
            <React.Fragment key={item.href}>
              {idx > 0 && (
                <span aria-hidden="true" className="text-brand-border font-mono text-xs select-none px-1">
                  /
                </span>
              )}
              <a
                href={item.href}
                className="min-h-[40px] px-3.5 inline-flex items-center rounded-sm text-xs font-extrabold uppercase tracking-wider text-brand-textSecondary hover:text-brand-primaryText hover:bg-brand-surfaceHover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                {item.label}
              </a>
            </React.Fragment>
          ))}
        </nav>

        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-md bg-brand-primary hover:bg-brand-primaryHover text-[#0A0B0D] text-xs sm:text-sm font-black uppercase tracking-wider border border-brand-primary shadow-md shadow-brand-primary/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg shrink-0"
        >
          <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Acceso</span>
        </Link>
      </div>
    </header>
  );
}
