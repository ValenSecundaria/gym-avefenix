"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import { gymBroadcast, toCheckInKey, type CheckInKey } from "@/lib/screens/broadcast-channel";
import { isMobileDevice } from "@/lib/screens/screen-dispatcher";
import { requestFullscreen } from "./use-checkin-display";

export function useCheckInKeypad(
  onKey: (key: CheckInKey) => void,
  onReset: () => void
) {
  const onKeyEvt = useEffectEvent(onKey);
  const onResetEvt = useEffectEvent(onReset);

  useEffect(() => {
    if (isMobileDevice()) window.location.replace("/admin");
    const onKeyDown = (e: KeyboardEvent) => {
      requestFullscreen();
      const key = toCheckInKey(e, false);
      if (key) {
        e.preventDefault();
        onKeyEvt(key);
      }
    };
    const onPointerDown = () => requestFullscreen();
    const unsub = gymBroadcast.subscribe((msg) => {
      if (msg.type === "CHECKIN_KEY") onKeyEvt(msg.key);
      else if (msg.type === "RESET_CHECKIN") onResetEvt();
      else if (msg.type === "CLOSE_ALL_SCREENS" || msg.type === "SESSION_LOGOUT") {
        try {
          window.close();
        } catch {
          // ignore
        }
        if (!window.closed) {
          window.location.replace("/login");
        }
      }
    });
    const aliveId = window.setInterval(() => gymBroadcast.postMessage({ type: "CHECKIN_ALIVE" }), 2000);
    requestFullscreen();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      unsub();
      window.clearInterval(aliveId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);
}
