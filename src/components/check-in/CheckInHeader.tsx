"use client";

import React from "react";
import Link from "next/link";
import { Flame, LayoutDashboard, Maximize } from "lucide-react";

interface CheckInHeaderProps {
  isFullscreen: boolean;
  onRequestFullscreen: () => void;
}

export function CheckInHeader({ isFullscreen, onRequestFullscreen }: CheckInHeaderProps) {
  return (
    <header className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4 pb-4 border-b border-[#2C2D35]">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F95716] to-[#D92614] flex items-center justify-center text-white shadow-[0_0_24px_rgba(249,87,22,0.35)]">
          <Flame className="w-8 h-8" />
        </div>
        <div>
          <span className="font-extrabold text-2xl sm:text-3xl tracking-tight text-[#F4F5F7] block">
            Gimnasio Ave Fénix
          </span>
          <span className="text-sm uppercase tracking-widest text-[#F95716] font-bold block">
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
            className="min-h-[48px] inline-flex items-center gap-2 px-4 rounded-xl bg-[#F95716] hover:bg-[#F95716]/90 text-sm font-bold text-white transition-colors cursor-pointer"
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
          className="w-12 h-12 inline-flex items-center justify-center rounded-xl text-[#2C2D35] hover:text-[#8A909A] hover:bg-[#17171C] transition-colors"
        >
          <LayoutDashboard className="w-5 h-5" />
        </Link>
      </div>
    </header>
  );
}
