"use client";

import { useEffect, useSyncExternalStore } from "react";
import { gymBroadcast } from "@/lib/screens/broadcast-channel";
import {
  getCheckInDisplaySnapshot,
  getCheckInDisplayServerSnapshot,
  subscribeCheckInDisplay,
  writeCheckInDisplayCache,
  clearCheckInDisplayCache,
} from "@/lib/screens/checkin-display-cache";

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

export function requestFullscreen() {
  if (document.fullscreenElement || !document.fullscreenEnabled) return;
  document.documentElement.requestFullscreen({ navigationUI: "hide" }).catch(() => {});
}

export function useCheckInDisplay() {
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
      } else if (msg.type === "REQUEST_FULLSCREEN") {
        requestFullscreen();
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

  return { display, isFullscreen, currentResult };
}
