"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { Flame, LayoutDashboard } from "lucide-react";
import type { CheckInVerificationResult } from "@/types";
import { gymBroadcast } from "@/lib/screens/broadcast-channel";
import {
  getCheckInDisplaySnapshot,
  getCheckInDisplayServerSnapshot,
  subscribeCheckInDisplay,
  writeCheckInDisplayCache,
  clearCheckInDisplayCache,
} from "@/lib/screens/checkin-display-cache";
import { KeypadInput } from "./KeypadInput";
import { MemberResultCard } from "./MemberResultCard";
import { IdleDisplay } from "./IdleDisplay";

const ALERT_DURATION_SECONDS = 60;

interface CheckInMonitorClientProps {
  onVerifyDni: (dni: string) => Promise<{
    success: boolean;
    data?: CheckInVerificationResult;
    error?: string;
  }>;
}

// La hora se guarda y solo cambia en el temporizador: si getSnapshot devolviera Date.now() en cada
// llamada, React vería un valor distinto en cada lectura y entraría en un bucle de renders.
let nowSnapshot = 0;

function subscribeNow(callback: () => void) {
  const tick = () => {
    nowSnapshot = Date.now();
    callback();
  };
  tick();
  const intervalId = window.setInterval(tick, 250);
  return () => window.clearInterval(intervalId);
}

function getNowClientSnapshot(): number {
  return nowSnapshot;
}

function getNowServerSnapshot(): number {
  return 0;
}

export function CheckInMonitorClient({ onVerifyDni }: CheckInMonitorClientProps) {
  const [dniInput, setDniInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Lo que se muestra vive en caché local (sobrevive a recargas / reinicios de la PC del molinete):
  // - lastEnabled: último socio HABILITADO, queda en pantalla indefinidamente hasta el próximo ingreso.
  // - alert + alertUntil: CUOTA_VENCIDA / LIMITE_ALCANZADO con su hora límite absoluta.
  const display = useSyncExternalStore(
    subscribeCheckInDisplay,
    getCheckInDisplaySnapshot,
    getCheckInDisplayServerSnapshot,
  );
  const now = useSyncExternalStore(
    subscribeNow,
    getNowClientSnapshot,
    getNowServerSnapshot,
  );

  const alertActive = Boolean(display.alert && display.alertUntil && now > 0 && display.alertUntil > now);
  const currentResult = alertActive ? display.alert : display.lastEnabled;

  // Sincronización inter-pantallas mediante BroadcastChannel
  useEffect(() => {
    const unsubscribe = gymBroadcast.subscribe((msg) => {
      if (msg.type === "RESET_CHECKIN") {
        clearCheckInDisplayCache();
        setDniInput("");
      } else if (msg.type === "REQUEST_FULLSCREEN") {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      }
    });
    return unsubscribe;
  }, []);

  // Regla 03: CUOTA_VENCIDA o LIMITE_ALCANZADO se borra a los 60s y vuelve al último HABILITADO.
  // Se calcula contra la hora límite (no restando de a 1) para no atrasarse si la pestaña queda en segundo plano.
  useEffect(() => {
    const { alert, alertUntil, lastEnabled } = display;
    if (!alert || !alertUntil) return;
    if (now > 0 && now >= alertUntil) {
      writeCheckInDisplayCache({ lastEnabled, alert: null, alertUntil: null });
    }
  }, [display, now]);

  const handleDniChange = (val: string) => {
    setDniInput(val);
    if (errorMsg) setErrorMsg(null);
  };

  const handleVerifySubmit = async (dni: string) => {
    const trimmed = dni.trim();
    if (trimmed.length < 6 || trimmed.length > 8) {
      setErrorMsg("El DNI debe tener entre 6 y 8 dígitos numéricos.");
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await onVerifyDni(trimmed);
      if (!response.success || !response.data) {
        setErrorMsg(response.error || "No se encontró un socio registrado con ese DNI.");
        return;
      }
      const verified = response.data;
      setDniInput("");

      // Notificar al Dashboard de recepción en vivo
      gymBroadcast.postMessage({ type: "CHECKIN_EVENT", payload: verified });

      if (verified.status === "HABILITADO") {
        writeCheckInDisplayCache({ lastEnabled: verified, alert: null, alertUntil: null });
      } else {
        const current = Date.now();
        writeCheckInDisplayCache({
          lastEnabled: display.lastEnabled,
          alert: verified,
          alertUntil: current + ALERT_DURATION_SECONDS * 1000,
        });
      }
    } catch {
      setErrorMsg("Error de conexión al verificar el ingreso. Intentá nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F4F5F7] flex flex-col justify-between p-4 sm:p-6 lg:p-10 select-none">
      {/* Top Brand Bar (Stitch Screen 1) */}
      <header className="w-full max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#2C2D35]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F95716] to-[#D92614] flex items-center justify-center text-white shadow-[0_0_24px_rgba(249,87,22,0.35)] border border-[#F95716]/40">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-[#F4F5F7] block">
              Gimnasio Ave Fénix
            </span>
            <span className="text-xs uppercase tracking-widest text-[#F95716] font-bold block">
              Puesto de Ingreso
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="min-h-[48px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#17171C] hover:bg-[#23232A] border border-[#2C2D35] text-xs sm:text-sm font-semibold text-[#8A909A] hover:text-[#F4F5F7] transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-[#F95716]" />
            <span>Panel Recepción</span>
          </Link>
        </div>
      </header>

      {/* Área Principal: Teclado Numérico + Tarjeta de Resultado / IdleDisplay */}
      <main className="w-full max-w-6xl mx-auto my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        <div className="lg:col-span-5">
          <KeypadInput
            value={dniInput}
            onChange={handleDniChange}
            onSubmit={handleVerifySubmit}
            isLoading={isLoading}
            error={errorMsg}
          />
        </div>

        <div className="lg:col-span-7 flex items-center justify-center">
          {currentResult ? (
            <MemberResultCard result={currentResult} />
          ) : (
            <IdleDisplay />
          )}
        </div>
      </main>

      {/* Footer Strip (Stitch Screen 1) */}
      <footer className="w-full max-w-6xl mx-auto pt-4 border-t border-[#2C2D35]/60 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8A909A] gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981] animate-pulse" />
          <span>Molinete Ave Fénix Conectado • Listo para ingreso</span>
        </div>
        <span> Alertas de cuota/límite reinician automáticamente en 60 seg</span>
      </footer>
    </div>
  );
}
