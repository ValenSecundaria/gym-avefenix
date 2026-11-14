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
          className="flex items-center gap-2 bg-[#F95716] hover:bg-[#ea4807] text-white font-semibold px-4 min-h-[44px] rounded-lg transition-colors cursor-pointer text-sm shadow-sm"
          title="Volver a los ingresos en vivo de hoy"
        >
          <RotateCcw className="w-4 h-4" />
          <span>← Volver a Hoy (En vivo)</span>
        </button>
      )}

      <div className="flex items-center gap-2 bg-[#17171C] border border-[#2C2D35] rounded-lg px-3 min-h-[44px]">
        <Calendar className="w-4 h-4 text-[#8A909A] shrink-0" />
        <label htmlFor="historical-date-input" className="text-xs font-semibold text-[#8A909A] whitespace-nowrap">
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
          className="bg-transparent text-[#F4F5F7] text-sm font-medium focus:outline-none cursor-pointer [color-scheme:dark]"
        />
      </div>

      {recentDates.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-[#8A909A]">
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
                    ? "bg-[#F95716]/20 border-[#F95716] text-[#F95716]"
                    : "bg-[#17171C] border-[#2C2D35] text-[#F4F5F7] hover:border-[#8A909A]"
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
