"use client";

import React from "react";
import { RefreshCw, Database } from "lucide-react";

interface BatchSyncBadgeProps {
  pendingCount: number;
  formattedCountdown: string;
  isSyncing: boolean;
  onSyncNow: () => void;
}

export function BatchSyncBadge({
  pendingCount,
  formattedCountdown,
  isSyncing,
  onSyncNow,
}: BatchSyncBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 sm:gap-3 px-3 py-1.5 rounded-xl bg-fx-surface border border-fx-border text-xs">
      <div className="flex items-center gap-1.5 font-semibold text-fx-muted">
        <span
          className={`w-2 h-2 rounded-full ${
            pendingCount > 0 ? "bg-fx-orange animate-pulse" : "bg-fx-green"
          }`}
        />
        <span>Cola:</span>
        <span className="font-mono font-bold text-fx-text">{pendingCount}</span>
        <span className="hidden sm:inline">pendientes</span>
      </div>

      <span className="text-fx-border">•</span>

      <div className="flex items-center gap-1.5 font-semibold text-fx-muted">
        <span className="hidden sm:inline">Próximo lote:</span>
        <span className="font-mono font-bold text-fx-orange">{formattedCountdown}</span>
      </div>

      <button
        type="button"
        onClick={onSyncNow}
        disabled={isSyncing}
        aria-label="Sincronizar Lote Ahora"
        title="Forzar guardado del lote a Neon"
        className="ml-1 min-h-[32px] px-2.5 py-1 rounded-lg bg-fx-base hover:bg-fx-hover border border-fx-border text-fx-orange hover:text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
        <span className="hidden md:inline">Sincronizar Lote</span>
      </button>
    </div>
  );
}
