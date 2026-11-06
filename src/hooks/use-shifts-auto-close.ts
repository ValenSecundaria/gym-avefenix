"use client";

import { useEffect, useRef } from "react";

export function useShiftsAutoClose(onAutoClosed?: () => void) {
  const onAutoClosedRef = useRef(onAutoClosed);
  useEffect(() => {
    onAutoClosedRef.current = onAutoClosed;
  }, [onAutoClosed]);

  useEffect(() => {
    let lastClosedDateStr = "";

    const checkTime = async () => {
      // Formato fecha y hora en Argentina (UTC-3)
      const nowStr = new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" });
      const now = new Date(nowStr);
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const todayDateStr = now.toDateString();

      // Disparar a las 22:05 o posterior si no se ejecutó hoy en este cliente
      if ((hours > 22 || (hours === 22 && minutes >= 5)) && lastClosedDateStr !== todayDateStr) {
        lastClosedDateStr = todayDateStr;
        try {
          const res = await fetch("/api/shifts/auto-close", { method: "POST" });
          const data = await res.json();
          if (data.closedCount > 0) {
            onAutoClosedRef.current?.();
          }
        } catch (err) {
          console.warn("[useShiftsAutoClose] Error en cierre automático:", err);
        }
      }
    };

    void checkTime();
    const interval = setInterval(checkTime, 30_000);
    return () => clearInterval(interval);
  }, []);
}
