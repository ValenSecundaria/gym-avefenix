"use client";

import React, { useState, useEffect, useEffectEvent, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { Flame, LayoutDashboard, Maximize } from "lucide-react";
import type { CheckInVerificationResult } from "@/types";
import { gymBroadcast, toCheckInKey, type CheckInKey } from "@/lib/screens/broadcast-channel";
import {
  getCheckInDisplaySnapshot,
  getCheckInDisplayServerSnapshot,
  subscribeCheckInDisplay,
  writeCheckInDisplayCache,
  clearCheckInDisplayCache,
} from "@/lib/screens/checkin-display-cache";
import { useCheckIn } from "@/hooks/use-checkin";
import { KeypadInput, DNI_MAX_LENGTH, DNI_MIN_LENGTH } from "./KeypadInput";
import { MemberResultCard } from "./MemberResultCard";
import { IdleDisplay } from "./IdleDisplay";

const ALERT_DURATION_SECONDS = 60;
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

function subscribeFullscreen(callback: () => void) {
  document.addEventListener("fullscreenchange", callback);
  return () => document.removeEventListener("fullscreenchange", callback);
}

/** Pantalla completa real (oculta la barra de tareas de Windows). Falla en silencio si el navegador no lo permite todavía. */
function requestFullscreen() {
  if (document.fullscreenElement || !document.fullscreenEnabled) return;
  document.documentElement.requestFullscreen({ navigationUI: "hide" }).catch(() => { });
}

export function CheckInMonitorClient({
  onVerifyDni,
}: {
  onVerifyDni?: (dni: string) => Promise<{
    success: boolean;
    data?: CheckInVerificationResult;
    error?: string;
  }>;
}) {
  const [dniInput, setDniInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dniRef = useRef("");
  const loadingRef = useRef(false);
  const setDni = (value: string) => {
    dniRef.current = value;
    setDniInput(value);
  };
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { verifyAndLogCheckIn } = useCheckIn();

  const display = useSyncExternalStore(
    subscribeCheckInDisplay,
    getCheckInDisplaySnapshot,
    getCheckInDisplayServerSnapshot
  );
  const now = useSyncExternalStore(subscribeNow, () => nowSnapshot, () => 0);
  const isFullscreen = useSyncExternalStore(
    subscribeFullscreen,
    () => Boolean(document.fullscreenElement),
    () => true
  );

  const alertActive = Boolean(display.alert && display.alertUntil && now > 0 && display.alertUntil > now);
  const currentResult = alertActive ? display.alert : display.lastEnabled;

  useEffect(() => {
    const unsubscribe = gymBroadcast.subscribe((msg) => {
      if (msg.type === "RESET_CHECKIN") {
        clearCheckInDisplayCache();
        setDni("");
      } else if (msg.type === "REQUEST_FULLSCREEN") {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => { });
        }
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const { alert, alertUntil, lastEnabled } = display;
    if (!alert || !alertUntil) return;
    if (now > 0 && now >= alertUntil) {
      writeCheckInDisplayCache({ lastEnabled, alert: null, alertUntil: null });
    }
  }, [display, now]);

  const handleVerifySubmit = async (dni: string) => {
    const trimmed = dni.trim();
    if (trimmed.length < DNI_MIN_LENGTH || trimmed.length > DNI_MAX_LENGTH) {
      setErrorMsg(`El DNI tiene que tener entre ${DNI_MIN_LENGTH} y ${DNI_MAX_LENGTH} números.`);
      return;
    }
    loadingRef.current = true;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = onVerifyDni ? await onVerifyDni(trimmed) : await verifyAndLogCheckIn(trimmed);
      if (!response.success || !response.data) {
        setErrorMsg(response.error || "No se encontró un socio registrado con ese DNI.");
        // Se borra el número erróneo para que pueda volver a escribir de cero.
        setDni("");
        return;
      }
      const verified = response.data;
      setDni("");

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
      setErrorMsg("Error de validación al verificar el ingreso. Intentá nuevamente.");
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  };

  // Una sola entrada para todas las teclas: teclado físico de esta ventana,
  // teclado numérico reenviado desde el panel y botones en pantalla.
  const pressKey = (key: CheckInKey) => {
    if (loadingRef.current) return;
    // Se lee del ref: las teclas reenviadas pueden llegar más rápido que el re-render.
    const current = dniRef.current;
    if (key === "Enter") {
      void handleVerifySubmit(current);
      return;
    }
    if (errorMsg) setErrorMsg(null);
    if (key === "Clear") setDni("");
    else if (key === "Backspace") setDni(current.slice(0, -1));
    else if (current.length < DNI_MAX_LENGTH) setDni(current + key);
  };
  const onExternalKey = useEffectEvent(pressKey);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      requestFullscreen();
      const key = toCheckInKey(e, false);
      if (!key) return;
      e.preventDefault();
      onExternalKey(key);
    };
    const onPointerDown = () => requestFullscreen();
    const unsubscribe = gymBroadcast.subscribe((msg) => {
      if (msg.type === "CHECKIN_KEY") onExternalKey(msg.key);
    });

    // Avisa al panel que esta ventana está abierta para que le reenvíe el teclado numérico.
    const sendAlive = () => gymBroadcast.postMessage({ type: "CHECKIN_ALIVE" });
    sendAlive();
    const aliveId = window.setInterval(sendAlive, 2000);

    // Con "Pantalla completa automática" permitida en Chrome entra sola; si no, en la primera tecla o toque.
    requestFullscreen();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      unsubscribe();
      window.clearInterval(aliveId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F4F5F7] flex flex-col p-4 sm:p-6 lg:p-8 select-none cursor-default">
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
              Ingreso de socios
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isFullscreen && (
            <button
              type="button"
              tabIndex={-1}
              onClick={requestFullscreen}
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

      <main className="w-full max-w-7xl mx-auto flex-1 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        <div className="lg:col-span-5">
          <KeypadInput value={dniInput} onKey={pressKey} isLoading={isLoading} error={errorMsg} />
        </div>

        <div className="lg:col-span-7 flex items-center justify-center">
          {currentResult ? <MemberResultCard result={currentResult} /> : <IdleDisplay />}
        </div>
      </main>

      <footer className="w-full max-w-7xl mx-auto pt-3 border-t border-[#2C2D35]/60 flex items-center justify-center text-sm text-[#8A909A] gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981] animate-pulse" />
        <span>Listo para ingresar</span>
      </footer>
    </div>
  );
}
