"use client";

import React from "react";
import { Calendar, RotateCcw } from "lucide-react";

interface HistoricalDateSelectorProps {
  selectedDate: string;
  todayStr: string;
  onSelectDate: (date: string) => void;
  recentDates: string[];
}

function formatDatePill(dateKey: string): string {
  const parts = dateKey.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`;
  }
  return dateKey;
}

export function HistoricalDateSelector({
  selectedDate,
  todayStr,
  onSelectDate,
  recentDates,
}: HistoricalDateSelectorProps) {
  const isPastDate = selectedDate !== todayStr;

  return (
    <div className="hidden lg:flex items-center gap-3">
      {isPastDate && (
        <button
          type="button"
          onClick={(e) => {
            onSelectDate(todayStr);
            e.currentTarget.blur();
          }}
          className="flex items-center gap-2 bg-fx-orange hover:bg-fx-orange/90 text-white font-semibold px-4 min-h-[44px] rounded-lg transition-colors cursor-pointer text-sm shadow-sm"
          title="Volver a los ingresos en vivo de hoy"
        >
          <RotateCcw className="w-4 h-4" />
          <span>← Volver a Hoy (En vivo)</span>
        </button>
      )}

      <div className="flex items-center gap-2 bg-fx-surface border border-fx-border rounded-lg px-3 min-h-[44px]">
        <Calendar className="w-4 h-4 text-fx-muted shrink-0" />
        <label htmlFor="historical-date-input" className="text-xs font-semibold text-fx-muted whitespace-nowrap">
          Consultar otro día:
        </label>
        <input
          id="historical-date-input"
          type="date"
          max={todayStr}
          value={selectedDate}
          onChange={(e) => {
            if (e.target.value) {
              onSelectDate(e.target.value);
            }
            e.currentTarget.blur();
          }}
          onKeyDown={(e) => {
            if (/^[0-9]$/.test(e.key) || e.code.startsWith("Numpad") || e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          className="bg-transparent text-fx-text text-sm font-medium focus:outline-none cursor-pointer [color-scheme:dark]"
        />
      </div>

      {recentDates.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-fx-muted">
          <span className="hidden xl:inline">Últimas vistas:</span>
          {recentDates.map((date) => {
            const isCurrent = date === selectedDate;
            return (
              <button
                key={date}
                type="button"
                onClick={(e) => {
                  onSelectDate(date);
                  e.currentTarget.blur();
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer border ${
                  isCurrent
                    ? "bg-fx-orange/20 border-fx-orange text-fx-orangeText"
                    : "bg-fx-surface border-fx-border text-fx-text hover:border-fx-muted"
                }`}
                title={`Ver fecha ${date}`}
              >
                {formatDatePill(date)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
