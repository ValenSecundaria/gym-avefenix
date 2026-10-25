"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getPendingCheckIns,
  removeSyncedCheckIns,
  getMembersCacheCount,
  saveMembersToCache,
} from "@/lib/db/indexed-db";
import { syncBatchCheckInsAction, getFullMembersCacheAction } from "@/actions/sync.actions";
import { gymBroadcast } from "@/lib/screens/broadcast-channel";

const BATCH_INTERVAL_SECONDS = 3600; // 1 hora exacta (3600000 ms)
const CACHE_STALE_MS = 12 * 60 * 60 * 1000; // 12 horas

export function useBatchSync() {
  const [pendingCount, setPendingCount] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(BATCH_INTERVAL_SECONDS);
  const [isSyncing, setIsSyncing] = useState(false);
  const isSyncingRef = useRef(false);

  const refreshPendingCount = useCallback(async () => {
    try {
      const items = await getPendingCheckIns();
      setPendingCount(items.length);
    } catch {
      // Ignorar en SSR o error de apertura
    }
  }, []);

  const flushQueue = useCallback(async (): Promise<{ success: boolean; count: number }> => {
    if (isSyncingRef.current) return { success: false, count: 0 };
    isSyncingRef.current = true;
    setIsSyncing(true);

    try {
      const pending = await getPendingCheckIns();
      if (pending.length === 0) {
        setSecondsRemaining(BATCH_INTERVAL_SECONDS);
        return { success: true, count: 0 };
      }

      const payload = pending.map((p) => ({
        memberId: p.memberId,
        status: p.status,
        createdAt: p.createdAt,
      }));

      const res = await syncBatchCheckInsAction(payload);
      if (res.success) {
        const ids = pending.map((p) => p.id!).filter((id): id is number => typeof id === "number");
        await removeSyncedCheckIns(ids);
        await refreshPendingCount();
        setSecondsRemaining(BATCH_INTERVAL_SECONDS);
        return { success: true, count: res.data?.count || ids.length };
      }
      return { success: false, count: 0 };
    } catch (err) {
      console.error("[useBatchSync] Error al sincronizar lote:", err);
      return { success: false, count: 0 };
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, [refreshPendingCount]);

  useEffect(() => {
    async function initSnapshot() {
      try {
        const count = await getMembersCacheCount();
        const lastSync = Number(localStorage.getItem("gym_cache_sync_ts") || "0");
        const isStale = Date.now() - lastSync > CACHE_STALE_MS;

        if (count === 0 || isStale) {
          const res = await getFullMembersCacheAction();
          if (res.success && res.data) {
            await saveMembersToCache(res.data);
            localStorage.setItem("gym_cache_sync_ts", Date.now().toString());
          }
        }
      } catch (err) {
        console.warn("[useBatchSync] Error sincronizando snapshot inicial:", err);
      }
      await refreshPendingCount();
    }
    initSnapshot();

    const unsubscribe = gymBroadcast.subscribe((msg) => {
      if (msg.type === "CHECKIN_LOGGED") {
        setPendingCount((prev) => prev + 1);
      }
    });

    const timer = window.setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          void flushQueue();
          return BATCH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    const handleBeforeUnload = () => {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        getPendingCheckIns().then((items) => {
          if (items.length > 0) {
            const body = JSON.stringify(items.map((i) => ({
              memberId: i.memberId,
              status: i.status,
              createdAt: i.createdAt,
            })));
            navigator.sendBeacon("/api/sync/batch", new Blob([body], { type: "application/json" }));
          }
        });
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      unsubscribe();
      window.clearInterval(timer);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [flushQueue, refreshPendingCount]);

  const mm = Math.floor(secondsRemaining / 60).toString().padStart(2, "0");
  const ss = (secondsRemaining % 60).toString().padStart(2, "0");
  const formattedCountdown = `${mm}:${ss}`;

  return {
    pendingCount,
    formattedCountdown,
    isSyncing,
    flushQueue,
    refreshPendingCount,
  };
}
