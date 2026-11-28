"use client";

import React, { useState } from "react";
import { Clock, Loader2 } from "lucide-react";
import { syncInitialMemberPeriodAction } from "@/actions/transition-sync.actions";
import { saveMembersToCache } from "@/lib/db/indexed-db";
import { gymBroadcast } from "@/lib/screens/broadcast-channel";
import { syncPeriodValidUntil } from "@/lib/sync-period-date";
import { formatDateAR } from "@/lib/utils";

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
  // Fecha que va a quedar (se calcula al abrir la confirmación, no durante el render).
  const [previewDate, setPreviewDate] = useState("");

  const open = () => {
    setPreviewDate(formatDateAR(syncPeriodValidUntil(new Date()).toISOString()));
    setIsOpen(true);
  };

  const handleConfirm = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await syncInitialMemberPeriodAction({ memberId });
      if (res.success && res.data) {
        if (res.data.cached) {
          await saveMembersToCache([res.data.cached]).catch(() => {});
          gymBroadcast.postMessage({ type: "MEMBER_UPDATED", member: res.data.cached });
        }
        gymBroadcast.postMessage({ type: "REFRESH_DASHBOARD" });
        onSuccess?.(`✓ ${fullName} regularizado: vence el ${formatDateAR(res.data.validUntil)} (30 días desde hoy, sin cobro).`);
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
        onClick={open}
        title="Regularizar cuota sin cobro (vence en 30 días desde hoy)"
        className={`min-h-[44px] px-3 rounded-xl bg-fx-surface hover:bg-fx-hover border border-fx-border text-xs sm:text-sm font-bold text-fx-text inline-flex items-center gap-1.5 transition-colors cursor-pointer ${className}`}
      >
        <Clock className="w-4 h-4 text-fx-orange shrink-0" />
        <span className="truncate">⏱️ Regularizar (30 días desde hoy)</span>
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
              <span>Regularizar cuota sin cobro</span>
            </div>
            <p className="text-sm text-fx-text leading-relaxed">
              El vencimiento de <strong className="text-white">{fullName}</strong> va a quedar el{" "}
              <strong className="text-fx-orange">{previewDate}</strong> (30 días desde hoy).
            </p>
            <p className="text-xs text-fx-muted">
              No se suman los días que le quedaban: la cuota se cuenta solo desde hoy. No se registra ningún cobro en caja y el
              socio queda <strong>HABILITADO</strong> en el molinete.
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
                <span>Confirmar (vence {previewDate})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
