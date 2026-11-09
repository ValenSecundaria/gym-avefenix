"use client";

import React, { useState } from "react";
import { Clock, Loader2 } from "lucide-react";
import { syncInitialMemberPeriodAction } from "@/actions/transition-sync.actions";
import { saveMembersToCache } from "@/lib/db/indexed-db";
import { gymBroadcast } from "@/lib/screens/broadcast-channel";

// TODO [TEMPORARY-TRANSITION]: Eliminar este botón al finalizar el primer mes
interface Props {
  memberId: string;
  fullName: string;
  onSuccess?: (msg: string) => void;
  className?: string;
}

export function TemporarySyncPeriodButton({ memberId, fullName, onSuccess, className = "" }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await syncInitialMemberPeriodAction({ memberId, daysToAdd: 30 });
      if (res.success && res.data) {
        if (res.data.cached) {
          await saveMembersToCache([res.data.cached]).catch(() => {});
          gymBroadcast.postMessage({ type: "MEMBER_UPDATED", member: res.data.cached });
        }
        gymBroadcast.postMessage({ type: "REFRESH_DASHBOARD" });
        onSuccess?.(`✓ Se extendió 30 días la cuota de ${fullName} sin cobro en caja.`);
        setIsOpen(false);
      } else {
        alert(res.error || "No se pudo extender el período.");
      }
    } catch {
      alert("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="Regularizar cuota sin cobro (+30 días)"
        className={`min-h-[44px] px-3 rounded-xl bg-fx-surface hover:bg-fx-hover border border-fx-border text-xs sm:text-sm font-bold text-fx-text inline-flex items-center gap-1.5 transition-colors cursor-pointer ${className}`}
      >
        <Clock className="w-4 h-4 text-fx-orange shrink-0" />
        <span className="truncate">⏱️ Regularizar (+30 Días)</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="bg-fx-surface border border-fx-border w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-left">
            <div className="flex items-center gap-2 text-fx-orange font-bold text-base">
              <Clock className="w-5 h-5 shrink-0" />
              <span>Extender Período sin Cobro</span>
            </div>
            <p className="text-sm text-fx-text leading-relaxed">
              ¿Confirmar extensión de 30 días a <strong className="text-white">{fullName}</strong> sin cobro en caja?
            </p>
            <p className="text-xs text-fx-muted">
              Se extenderá la fecha de vencimiento y el socio quedará <strong>HABILITADO</strong> en el molinete de forma inmediata.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="min-h-[44px] px-4 rounded-xl border border-fx-border bg-fx-base hover:bg-fx-hover text-xs sm:text-sm font-bold text-fx-muted hover:text-fx-text cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleConfirm()}
                disabled={loading}
                className="min-h-[44px] px-4 rounded-xl bg-fx-orange hover:bg-fx-orange/90 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-[0_4px_16px_rgba(249,87,22,0.35)] cursor-pointer disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Confirmar (+30 días)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
