"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  getCachedDateCheckIns,
  saveDateCheckInsToCache,
  getRecentCachedDates,
} from "@/lib/db/historical-cache";
import {
  getCheckInsByDateAction,
  type HistoricalCheckInItem,
} from "@/actions/historical-checkins.actions";
import { HistoricalDateSelector } from "./historical-date-selector";
import { LiveFeedTable } from "../LiveFeedTable";
import { gymBroadcast } from "@/lib/screens/broadcast-channel";
import type { LiveCheckInItem } from "@/types";

interface HistoricalAttendanceSectionProps {
  todayCheckIns: LiveCheckInItem[];
  onEditMember: (memberId: string) => void;
  onSuccessSync?: (msg: string) => void;
  searchFilter: (fullName: string, dni: string) => boolean;
}

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateKey: string): string {
  const parts = dateKey.split("-");
  if (parts.length !== 3) return dateKey;
  const [year, month, day] = parts.map(Number);
  const dateObj = new Date(year, month - 1, day);
  return dateObj.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function HistoricalAttendanceSection({
  todayCheckIns,
  onEditMember,
  onSuccessSync,
  searchFilter,
}: HistoricalAttendanceSectionProps) {
  const [todayStr] = useState<string>(getTodayString);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [recentDates, setRecentDates] = useState<string[]>([]);
  const [historicalItems, setHistoricalItems] = useState<HistoricalCheckInItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cargar atajos de fechas recientes en caché
  const refreshRecentDates = useCallback(async () => {
    const dates = await getRecentCachedDates();
    setRecentDates(dates.filter((d) => d !== todayStr));
  }, [todayStr]);

  useEffect(() => {
    void refreshRecentDates();
  }, [refreshRecentDates]);

  // Si alguien ingresa al gimnasio o interactúa con el teclado/pantalla de ingreso,
  // devolver automáticamente la vista a los ingresos en vivo del día actual.
  useEffect(() => {
    const unsubscribe = gymBroadcast.subscribe((msg) => {
      if (
        msg.type === "CHECKIN_LOGGED" ||
        msg.type === "CHECKIN_EVENT" ||
        msg.type === "CHECKIN_KEY"
      ) {
        setSelectedDate(todayStr);
        setHistoricalItems([]);
        setErrorMsg(null);
      }
    });
    return () => unsubscribe();
  }, [todayStr]);

  // Manejar cambio de fecha
  const handleSelectDate = useCallback(
    async (dateKey: string) => {
      setSelectedDate(dateKey);
      if (dateKey === todayStr) {
        setHistoricalItems([]);
        setErrorMsg(null);
        return;
      }

      setLoading(true);
      setErrorMsg(null);

      try {
        // 1. Verificar primero en caché de IndexedDB (0 consultas a Neon)
        const cached = await getCachedDateCheckIns(dateKey);
        if (cached) {
          setHistoricalItems(cached);
          setLoading(false);
          void refreshRecentDates();
          return;
        }

        // 2. Si no existe en caché (Cache Miss), consultar Server Action
        const res = await getCheckInsByDateAction(dateKey);
        if (res.success && res.data) {
          setHistoricalItems(res.data);
          await saveDateCheckInsToCache(dateKey, res.data);
          void refreshRecentDates();
        } else {
          setErrorMsg(res.error || "No se pudieron obtener los registros de la fecha.");
          setHistoricalItems([]);
        }
      } catch (err) {
        console.error("Error al consultar ingresos por fecha:", err);
        setErrorMsg("Error de conexión al consultar la fecha seleccionada.");
        setHistoricalItems([]);
      } finally {
        setLoading(false);
      }
    },
    [todayStr, refreshRecentDates]
  );

  const isHistorical = selectedDate !== todayStr;

  const displayedItems = isHistorical ? historicalItems : todayCheckIns;
  const filteredItems = displayedItems.filter((c) => searchFilter(c.fullName, c.dni));

  return (
    <div className="flex flex-col gap-4">
      {/* Selector de fecha (Desktop-only) */}
      <div className="flex items-center justify-between pb-1">
        <HistoricalDateSelector
          selectedDate={selectedDate}
          todayStr={todayStr}
          onSelectDate={(d) => void handleSelectDate(d)}
          recentDates={recentDates}
        />
      </div>

      {/* Banner amigable cuando se consulta una fecha histórica */}
      {isHistorical && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-fx-surface border border-fx-border text-sm text-fx-text">
          <div className="flex items-center gap-2">
            <span className="text-base">📅</span>
            <span>
              Viendo ingresos del{" "}
              <strong className="capitalize text-fx-orangeText font-bold">
                {formatDisplayDate(selectedDate)}
              </strong>
            </span>
          </div>
          <div className="font-semibold text-xs text-fx-muted bg-fx-base px-3 py-1.5 rounded-lg border border-fx-border">
            Total:{" "}
            <span className="text-[#10B981] font-bold font-mono text-sm">
              {historicalItems.length}
            </span>{" "}
            {historicalItems.length === 1 ? "persona ingresó" : "personas ingresaron"} ese día
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-fx-red/10 border border-fx-red/30 text-sm text-fx-red font-semibold">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-sm text-fx-muted rounded-xl border border-dashed border-fx-border animate-pulse">
          Cargando ingresos de la fecha...
        </div>
      ) : (
        <LiveFeedTable
          items={filteredItems}
          onEditMember={onEditMember}
          onSuccessSync={onSuccessSync}
          isHistorical={isHistorical}
        />
      )}
    </div>
  );
}
