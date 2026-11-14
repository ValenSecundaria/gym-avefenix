"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, Maximize } from "lucide-react";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";

interface CheckInHeaderProps {
  isFullscreen: boolean;
  onRequestFullscreen: () => void;
}

export function CheckInHeader({ isFullscreen, onRequestFullscreen }: CheckInHeaderProps) {
  return (
    <header className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4 pb-4 border-b border-brand-border">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-brand-bg border border-brand-border flex items-center justify-center shadow-[0_0_24px_rgba(37,99,235,0.35)] shrink-0">
          <Image
            src={GYM_BRAND_CONFIG.assets.logoCheckIn}
            alt={GYM_BRAND_CONFIG.identity.shortName}
            width={56}
            height={56}
            className="w-full h-full object-cover"
            priority
          />
        </div>
        <div>
          <span className="font-extrabold text-2xl sm:text-3xl tracking-tight text-brand-textPrimary block">
            {GYM_BRAND_CONFIG.identity.name}
          </span>
          <span className="text-sm uppercase tracking-widest text-brand-primaryText font-bold block">
            Ingreso al gimnasio
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isFullscreen && (
          <button
            type="button"
            tabIndex={-1}
            onClick={onRequestFullscreen}
            className="min-h-[48px] inline-flex items-center gap-2 px-4 rounded-xl bg-brand-primary hover:bg-brand-primaryHover hover:text-brand-bg text-sm font-bold text-white transition-colors cursor-pointer"
          >
            <Maximize className="w-5 h-5" />
            <span className="hidden sm:inline">Pantalla completa</span>
          </button>
        )}
        <Link
          href="/admin"
          tabIndex={-1}
          aria-label="Ir al panel de recepción"
          title="Panel de recepción"
          className="w-12 h-12 inline-flex items-center justify-center rounded-xl text-brand-border hover:text-brand-textSecondary hover:bg-brand-surface transition-colors"
        >
          <LayoutDashboard className="w-5 h-5" />
        </Link>
      </div>
    </header>
  );
}
