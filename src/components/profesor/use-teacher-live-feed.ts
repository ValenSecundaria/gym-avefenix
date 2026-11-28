"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import type { LiveCheckInItem } from "@/types";
import { gymBroadcast } from "@/lib/screens/broadcast-channel";
import { getTodayCheckIns } from "@/actions/checkin.actions";
import { getTodayLocalCheckIns } from "@/lib/local-checkins";

export function useTeacherLiveFeed() {
  const [serverCheckIns, setServerCheckIns] = useState<LiveCheckInItem[]>([]);
  const [localCheckIns, setLocalCheckIns] = useState<LiveCheckInItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const reloadLocal = useCallback(async () => {
    try {
      setLocalCheckIns(await getTodayLocalCheckIns());
    } catch {
      // IndexedDB no disponible
    }
  }, []);

  const refreshCheckIns = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getTodayCheckIns();
      if (res.success && res.data) setServerCheckIns(res.data);
      await reloadLocal();
    } finally {
      setIsLoading(false);
    }
  }, [reloadLocal]);

  useEffect(() => {
    void reloadLocal();
    void refreshCheckIns();

    const unsubscribe = gymBroadcast.subscribe((msg) => {
      if (msg.type === "CHECKIN_LOGGED" && msg.checkIn) {
        void reloadLocal();
      } else if (msg.type === "REFRESH_DASHBOARD") {
        void refreshCheckIns();
      }
    });

    return () => unsubscribe();
  }, [reloadLocal, refreshCheckIns]);

  const seen = new Set<string>();
  const items: LiveCheckInItem[] = [];
  for (const c of [...localCheckIns, ...serverCheckIns]) {
    const key = `${c.dni}_${c.createdAt.slice(0, 16)}`;
    if (!seen.has(key)) {
      seen.add(key);
      items.push(c);
    }
  }

  return { checkIns: items, isLoadingCheckIns: isLoading, refreshCheckIns };
}
