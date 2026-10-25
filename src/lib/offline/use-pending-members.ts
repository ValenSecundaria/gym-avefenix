"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { listPendingMembers, removePendingMembers, subscribePendingMembers, type PendingMember } from "./pending-members-store";
import { syncPendingMembersNow, type MemberSyncSummary } from "./member-sync";

const RETRY_INTERVAL_MS = 20_000;

/**
 * Mantiene la lista de altas pendientes y las sube solas:
 * al abrir el panel, al volver la conexión (evento "online") y cada 20 s mientras quede algo.
 */
export function usePendingMembers(onSynced?: (summary: MemberSyncSummary) => void) {
  const [pending, setPending] = useState<PendingMember[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const onSyncedRef = useRef(onSynced);

  useEffect(() => {
    onSyncedRef.current = onSynced;
  }, [onSynced]);

  const reload = useCallback(() => {
    listPendingMembers().then(setPending);
  }, []);

  const syncNow = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) return null;
    setIsSyncing(true);
    try {
      const summary = await syncPendingMembersNow();
      if (summary.created > 0 || summary.alreadySynced > 0) onSyncedRef.current?.(summary);
      return summary;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    reload();
    const unsubscribe = subscribePendingMembers(reload);
    const handleOnline = () => {
      void syncNow();
    };
    window.addEventListener("online", handleOnline);
    const intervalId = window.setInterval(() => {
      listPendingMembers().then((items) => {
        if (items.some((p) => !p.blocked)) void syncNow();
      });
    }, RETRY_INTERVAL_MS);
    // Al abrir el panel se intenta subir lo que haya quedado de antes.
    const kickoffId = window.setTimeout(() => void syncNow(), 0);
    return () => {
      unsubscribe();
      window.removeEventListener("online", handleOnline);
      window.clearInterval(intervalId);
      window.clearTimeout(kickoffId);
    };
  }, [reload, syncNow]);

  const discard = useCallback((clientId: string) => removePendingMembers([clientId]), []);

  return { pending, isSyncing, syncNow, discard };
}
