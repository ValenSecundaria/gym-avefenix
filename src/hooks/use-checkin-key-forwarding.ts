"use client";

import { useEffect, useRef, useState } from "react";
import { gymBroadcast, toCheckInKey } from "@/lib/screens/broadcast-channel";

/** Si la pantalla de ingreso no da señales en este tiempo, se considera cerrada. */
const CHECKIN_ALIVE_TIMEOUT_MS = 6000;

const NON_TEXT_INPUT_TYPES = new Set(["button", "submit", "reset", "checkbox", "radio", "range", "color", "file", "image"]);

/** Hay un campo del panel donde se está escribiendo (buscador, alta, montos...). */
function isEditableElement(el: Element | null): boolean {
  if (!el) return false;
  if (el instanceof HTMLInputElement) return !NON_TEXT_INPUT_TYPES.has(el.type);
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return true;
  return el instanceof HTMLElement && el.isContentEditable;
}

/**
 * Panel de recepción (administración o profesor) con la pantalla de ingreso abierta en el otro monitor:
 * el teclado numérico es exclusivo del Check-In. Aunque el mouse esté usando el panel, cada tecla del
 * numpad se reenvía a la pantalla de ingreso; si no se está escribiendo en un campo, también Borrar,
 * Enter y los números comunes. Mientras hay una ventana abierta (alta, cobro, edición...) no se reenvía
 * nada: el numpad escribe en el formulario y al cerrarla vuelve al ingreso.
 * Devuelve si la pantalla de ingreso está abierta (se sabe por su latido).
 */
export function useCheckInKeyForwarding(): boolean {
  const [checkInScreenOnline, setCheckInScreenOnline] = useState(false);
  const lastAliveRef = useRef(0);

  useEffect(() => {
    const unsubscribe = gymBroadcast.subscribe((msg) => {
      if (msg.type === "CHECKIN_ALIVE") {
        lastAliveRef.current = Date.now();
        setCheckInScreenOnline(true);
      }
    });
    const watchdog = window.setInterval(() => {
      if (Date.now() - lastAliveRef.current > CHECKIN_ALIVE_TIMEOUT_MS) setCheckInScreenOnline(false);
    }, 2000);

    const onKeyDown = (e: KeyboardEvent) => {
      if (Date.now() - lastAliveRef.current > CHECKIN_ALIVE_TIMEOUT_MS) return;
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      const typingInPanel = isEditableElement(document.activeElement);
      // Escape queda para el panel (cerrar ventanas y menús).
      if (!typingInPanel && e.key === "Escape") return;
      const key = toCheckInKey(e, typingInPanel);
      if (!key) return;
      e.preventDefault();
      e.stopPropagation();
      gymBroadcast.postMessage({ type: "CHECKIN_KEY", key });
    };
    window.addEventListener("keydown", onKeyDown, true);

    return () => {
      unsubscribe();
      window.clearInterval(watchdog);
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);

  return checkInScreenOnline;
}
