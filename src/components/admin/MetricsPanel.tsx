"use client";

import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Clock, Flame, Lightbulb, Loader2, TrendingDown, TrendingUp, Users, CalendarDays, Ban, Moon } from "lucide-react";
import { getAttendanceAnalytics } from "@/actions/analytics.actions";
import type { AnalyticsPeriodDays, AttendanceAnalytics, HeatmapCell } from "@/types";

const DAY_NAMES = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const DAY_SHORT = ["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const PERIODS: { days: AnalyticsPeriodDays; label: string }[] = [
  { days: 30, label: "Último mes" },
  { days: 90, label: "Últimos 3 meses" },
  { days: 365, label: "Último año" },
];

const C = {
  orange: "#F95716",
  surface: "#17171C",
  base: "#0B0B0C",
  border: "#2C2D35",
  text: "#F4F5F7",
  muted: "#8A909A",
  grid: "#23232A",
  green: "#10B981",
  red: "#D92614",
};

const hourLabel = (h: number) => `${String(h).padStart(2, "0")} hs`;
const slotLabel = (h: number) => `${h} a ${h + 1} hs`;
const fmtPct = (p: number) => `${p > 0 ? "+" : ""}${p}%`;
const fmtNum = (n: number) => n.toLocaleString("es-AR", { maximumFractionDigits: 1 });
const fmtWeek = (d: string) => {
  const [, m, day] = d.split("-");
  return `${day}/${m}`;
};

function buildInsights(d: AttendanceAnalytics): string[] {
  const out: string[] = [];
  const peak = d.peakSlots[0];
  if (peak) {
    out.push(`El momento de más gente es el ${DAY_NAMES[peak.dow].toLowerCase()} de ${slotLabel(peak.hour)}: llegan ~${fmtNum(peak.avgArrivals)} socios en esa hora.`);
  }
  const ranked = d.weekdays.filter((w) => w.pctVsAverage !== null).sort((a, b) => b.pctVsAverage! - a.pctVsAverage!);
  const busy = ranked.filter((w) => w.pctVsAverage! >= 10).slice(0, 2);
  if (busy.length) {
    const names = busy.map((w) => DAY_NAMES[w.dow].toLowerCase()).join(" y los ");
    const pct = Math.round(busy.reduce((a, w) => a + w.pctVsAverage!, 0) / busy.length);
    out.push(`Los ${names} viene un ${pct}% más de gente que un día promedio.`);
  }
  const slow = ranked[ranked.length - 1];
  if (slow && slow.pctVsAverage! <= -10) {
    out.push(`El ${DAY_NAMES[slow.dow].toLowerCase()} es el día más tranquilo (${fmtPct(slow.pctVsAverage!)} vs. el promedio).`);
  }
  if (d.quietHours.length) {
    out.push(`Horarios más vacíos: ${d.quietHours.map((q) => hourLabel(q.hour)).join(", ")}. Buenos para clases nuevas o promociones.`);
  }
  if (d.trendPct !== null) {
    out.push(
      d.trendPct >= 0
        ? `La asistencia de las últimas 4 semanas creció un ${d.trendPct}% respecto de las 4 anteriores.`
        : `La asistencia de las últimas 4 semanas bajó un ${Math.abs(d.trendPct)}% respecto de las 4 anteriores.`
    );
  }
  if (d.avgVisitsPerWeek !== null) {
    out.push(`En promedio, cada socio que viene entrena ${fmtNum(d.avgVisitsPerWeek)} veces por semana.`);
  }
  return out;
}

function Card({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl bg-[#0B0B0C] border border-[#2C2D35] p-5 flex flex-col gap-4 ${className}`}>
      <div>
        <h3 className="text-base font-bold text-[#F4F5F7]">{title}</h3>
        {subtitle && <p className="text-xs text-[#8A909A] mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Tile({ icon, label, value, detail, tone = "default" }: { icon: React.ReactNode; label: string; value: string; detail: React.ReactNode; tone?: "default" | "accent" }) {
  return (
    <div className={`p-5 rounded-xl bg-[#0B0B0C] border ${tone === "accent" ? "border-[#F95716]/50" : "border-[#2C2D35]"} flex flex-col gap-2`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#8A909A] font-bold uppercase tracking-wider">{label}</span>
        <span className="text-[#F95716]">{icon}</span>
      </div>
      <div className="text-2xl font-extrabold text-[#F4F5F7] tracking-tight">{value}</div>
      <div className="text-xs text-[#8A909A]">{detail}</div>
    </div>
  );
}

function Delta({ pct, suffix }: { pct: number | null; suffix: string }) {
  if (pct === null) return <span>Sin datos suficientes para comparar</span>;
  const up = pct >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 font-bold ${up ? "text-[#10B981]" : "text-[#D92614]"}`}>
      <Icon className="w-3.5 h-3.5" />
      {fmtPct(pct)} <span className="font-normal text-[#8A909A]">{suffix}</span>
    </span>
  );
}

function ChartTooltip({ active, payload, label, labelFormatter }: { active?: boolean; payload?: { name: string; value: number; color?: string }[]; label?: string | number; labelFormatter: (l: string | number) => string }) {
  if (!active || !payload?.length || label === undefined) return null;
  return (
    <div className="rounded-lg bg-[#17171C] border border-[#2C2D35] px-3 py-2 text-xs shadow-lg">
      <div className="font-bold text-[#F4F5F7] mb-1">{labelFormatter(label)}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-[#8A909A]">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: p.color }} />
          <span>{p.name}:</span>
          <span className="font-mono font-bold text-[#F4F5F7]">{fmtNum(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function Heatmap({ cells, peaks }: { cells: HeatmapCell[]; peaks: HeatmapCell[] }) {
  const [hover, setHover] = useState<HeatmapCell | null>(null);
  const hours = cells.map((c) => c.hour);
  const minH = Math.min(...hours);
  const maxH = Math.max(...hours);
  const max = Math.max(...cells.map((c) => c.avgArrivals), 0.1);
  const byKey = new Map(cells.map((c) => [`${c.dow}-${c.hour}`, c]));
  const isPeak = (dow: number, hour: number) => peaks.some((p) => p.dow === dow && p.hour === hour);
  const cols = maxH - minH + 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <div className="grid gap-[2px] min-w-[560px]" style={{ gridTemplateColumns: `40px repeat(${cols}, minmax(22px, 1fr))` }}>
          <div />
          {Array.from({ length: cols }, (_, i) => (
            <div key={i} className="text-[10px] font-mono text-[#8A909A] text-center">
              {minH + i}
            </div>
          ))}
          {[1, 2, 3, 4, 5, 6, 7].map((dow) => (
            <React.Fragment key={dow}>
              <div className="text-xs font-semibold text-[#8A909A] flex items-center">{DAY_SHORT[dow]}</div>
              {Array.from({ length: cols }, (_, i) => {
                const hour = minH + i;
                const cell = byKey.get(`${dow}-${hour}`);
                const v = cell?.avgArrivals || 0;
                const alpha = v > 0 ? 0.12 + 0.88 * (v / max) : 0;
                return (
                  <div
                    key={hour}
                    onMouseEnter={() => setHover({ dow, hour, avgArrivals: v })}
                    onMouseLeave={() => setHover(null)}
                    className={`h-8 rounded-[4px] cursor-default ${isPeak(dow, hour) ? "ring-2 ring-[#F4F5F7]" : ""}`}
                    style={{ background: v > 0 ? `rgba(249, 87, 22, ${alpha})` : C.surface }}
                    aria-label={`${DAY_NAMES[dow]} ${slotLabel(hour)}: ${fmtNum(v)} llegadas promedio`}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#8A909A]">
        <div className="min-h-[18px]">
          {hover ? (
            <span>
              <b className="text-[#F4F5F7]">{DAY_NAMES[hover.dow]} de {slotLabel(hover.hour)}</b>: llegan{" "}
              <b className="font-mono text-[#F4F5F7]">{fmtNum(hover.avgArrivals)}</b> socios en promedio
            </span>
          ) : (
            <span>Pasá el mouse por un casillero para ver el detalle. Recuadro blanco = los 3 picos.</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span>Menos</span>
          <div className="w-28 h-2.5 rounded-full" style={{ background: "linear-gradient(90deg, rgba(249,87,22,0.12), rgba(249,87,22,1))" }} />
          <span>Más gente</span>
        </div>
      </div>
    </div>
  );
}

export function MetricsPanel() {
  const [period, setPeriod] = useState<AnalyticsPeriodDays>(90);
  const [data, setData] = useState<AttendanceAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedPeriod, setLoadedPeriod] = useState<AnalyticsPeriodDays | null>(null);
  const loading = loadedPeriod !== period;

  useEffect(() => {
    let cancelled = false;
    getAttendanceAnalytics(period).then((res) => {
      if (cancelled) return;
      if (res.success && res.data) {
        setData(res.data);
        setError(null);
      } else {
        setError(res.error || "Error al cargar las métricas");
      }
      setLoadedPeriod(period);
    });
    return () => {
      cancelled = true;
    };
  }, [period]);

  const periodSelector = (
    <div className="flex flex-wrap items-center gap-2">
      {PERIODS.map((p) => (
        <button
          key={p.days}
          type="button"
          onClick={() => setPeriod(p.days)}
          className={`min-h-[40px] px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            period === p.days ? "bg-[#F4F5F7] text-[#0B0B0C]" : "bg-[#0B0B0C] border border-[#2C2D35] text-[#8A909A] hover:text-[#F4F5F7]"
          }`}
        >
          {p.label}
        </button>
      ))}
      {loading && <Loader2 className="w-4 h-4 animate-spin text-[#F95716]" />}
    </div>
  );

  if (!data) {
    return (
      <div className="flex flex-col gap-5">
        {periodSelector}
        <div className="p-10 text-center text-sm text-[#8A909A]">
          {error ? <span className="text-[#D92614] font-bold">{error}</span> : "Calculando métricas de asistencia..."}
        </div>
      </div>
    );
  }

  const insights = buildInsights(data);
  const peak = data.peakSlots[0];
  const busiest = data.weekdays.filter((w) => w.avgVisits !== null).sort((a, b) => b.avgVisits! - a.avgVisits!)[0];
  const todayName = DAY_NAMES[data.today.dow].toLowerCase();
  const maxWeekday = Math.max(...data.weekdays.map((w) => w.avgVisits || 0));
  const freqTotal = data.frequency.reduce((a, f) => a + f.members, 0);

  return (
    <div className={`flex flex-col gap-5 transition-opacity ${loading ? "opacity-60" : ""}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-[#8A909A]">
          {data.totalVisits > 0
            ? `${fmtNum(data.totalVisits)} visitas en ${data.openDays} días con actividad • promedio ${fmtNum(data.avgDailyVisits)} socios por día`
            : "Todavía no hay ingresos registrados en este período."}
        </p>
        {periodSelector}
      </div>

      {/* KPIs de asistencia y picos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Tile
          tone="accent"
          icon={<Users className="w-5 h-5" />}
          label="En el gym ahora (aprox.)"
          value={`${data.today.estimatedInGymNow} personas`}
          detail="Ingresaron en los últimos 90 minutos"
        />
        <Tile
          icon={<Clock className="w-5 h-5" />}
          label={`Hoy vs. un ${todayName} normal`}
          value={`${data.today.visitsSoFar} / ${fmtNum(data.today.typicalSoFar)}`}
          detail={<Delta pct={data.today.pctVsTypical} suffix="a esta hora" />}
        />
        <Tile
          icon={<Flame className="w-5 h-5" />}
          label="Pico de la semana"
          value={peak ? `${DAY_SHORT[peak.dow]} ${slotLabel(peak.hour)}` : "—"}
          detail={peak ? `~${fmtNum(peak.avgArrivals)} llegadas en esa hora` : "Sin datos todavía"}
        />
        <Tile
          icon={<CalendarDays className="w-5 h-5" />}
          label="Día más concurrido"
          value={busiest ? DAY_NAMES[busiest.dow] : "—"}
          detail={
            busiest && busiest.pctVsAverage !== null ? (
              <Delta pct={busiest.pctVsAverage} suffix="vs. un día promedio" />
            ) : (
              "Sin datos todavía"
            )
          }
        />
      </div>

      {insights.length > 0 && (
        <Card title="Lo que dicen los números" subtitle="Conclusiones automáticas sobre el período elegido">
          <ul className="flex flex-col gap-2.5">
            {insights.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-sm text-[#F4F5F7]">
                <Lightbulb className="w-4 h-4 text-[#F95716] shrink-0 mt-0.5" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {data.heatmap.length > 0 && (
        <Card title="Mapa de picos: ¿cuándo viene la gente?" subtitle="Socios que llegan en cada hora, promedio por día de la semana">
          <Heatmap cells={data.heatmap} peaks={data.peakSlots} />
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title={`Hoy vs. un ${todayName} normal`} subtitle="Llegadas por hora. Barras: hoy • Línea: promedio de ese día">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.today.hourly} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke={C.grid} vertical={false} />
                <XAxis dataKey="hour" tickFormatter={(h) => `${h}`} tick={{ fill: C.muted, fontSize: 11 }} axisLine={{ stroke: C.border }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={<ChartTooltip labelFormatter={(l) => slotLabel(Number(l))} />} />
                <Bar dataKey="today" name="Hoy" fill={C.orange} radius={[4, 4, 0, 0]} maxBarSize={24} />
                <Line dataKey="typical" name={`Un ${todayName} normal`} stroke={C.text} strokeWidth={2} strokeDasharray="4 3" dot={false} type="monotone" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#8A909A]">
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#F95716]" />Hoy</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed border-[#F4F5F7]" />Un {todayName} normal</span>
          </div>
        </Card>

        <Card title="Asistencia por día de la semana" subtitle="Socios promedio por día • el más alto resaltado">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weekdays.map((w) => ({ ...w, name: DAY_SHORT[w.dow], value: w.avgVisits || 0 }))} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke={C.grid} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 11 }} axisLine={{ stroke: C.border }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  content={({ active, payload }) => {
                    const w = payload?.[0]?.payload as (typeof data.weekdays)[number] | undefined;
                    if (!active || !w) return null;
                    return (
                      <div className="rounded-lg bg-[#17171C] border border-[#2C2D35] px-3 py-2 text-xs shadow-lg">
                        <div className="font-bold text-[#F4F5F7]">{DAY_NAMES[w.dow]}</div>
                        {w.avgVisits === null ? (
                          <div className="text-[#8A909A]">Sin actividad en el período</div>
                        ) : (
                          <>
                            <div className="text-[#8A909A]">Promedio: <b className="font-mono text-[#F4F5F7]">{fmtNum(w.avgVisits)}</b> socios</div>
                            {w.pctVsAverage !== null && <div className="text-[#8A909A]">{fmtPct(w.pctVsAverage)} vs. un día promedio</div>}
                          </>
                        )}
                      </div>
                    );
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {data.weekdays.map((w) => (
                    <Cell key={w.dow} fill={w.avgVisits === maxWeekday && maxWeekday > 0 ? C.orange : "rgba(249,87,22,0.35)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Tendencia semanal" subtitle="Total de visitas por semana (semanas completas)">
          <div className="text-xs"><Delta pct={data.trendPct} suffix="últimas 4 semanas vs. las 4 anteriores" /></div>
          <div className="h-56">
            {data.weeklyTrend.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.weeklyTrend} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke={C.grid} vertical={false} />
                  <XAxis dataKey="weekStart" tickFormatter={fmtWeek} tick={{ fill: C.muted, fontSize: 11 }} axisLine={{ stroke: C.border }} tickLine={false} minTickGap={16} />
                  <YAxis allowDecimals={false} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ stroke: C.muted, strokeDasharray: "3 3" }} content={<ChartTooltip labelFormatter={(l) => `Semana del ${fmtWeek(String(l))}`} />} />
                  <Line dataKey="visits" name="Visitas" stroke={C.orange} strokeWidth={2} dot={false} activeDot={{ r: 5, stroke: C.base, strokeWidth: 2 }} type="monotone" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#8A909A]">Hacen falta al menos 2 semanas completas de datos.</div>
            )}
          </div>
        </Card>

        <Card title="¿Cada cuánto vienen los socios?" subtitle="Socios que vinieron en las últimas 4 semanas, según su frecuencia">
          <div className="flex flex-col gap-3">
            {data.frequency.map((f) => {
              const pct = freqTotal > 0 ? Math.round((f.members / freqTotal) * 100) : 0;
              return (
                <div key={f.label} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#F4F5F7]">{f.label}</span>
                    <span className="font-mono text-[#8A909A]">{f.members} socios • {pct}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#17171C] overflow-hidden">
                    <div className="h-full rounded-full bg-[#F95716]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#2C2D35]">
            <div className="flex items-start gap-2 text-xs text-[#8A909A]">
              <Moon className="w-4 h-4 text-[#8A909A] shrink-0" />
              <span>
                Horas tranquilas:{" "}
                <b className="text-[#F4F5F7]">{data.quietHours.length ? data.quietHours.map((q) => hourLabel(q.hour)).join(", ") : "—"}</b>
              </span>
            </div>
            <div className="flex items-start gap-2 text-xs text-[#8A909A]">
              <Ban className="w-4 h-4 text-[#D92614] shrink-0" />
              <span>
                Accesos rechazados: <b className="text-[#F4F5F7]">{data.rejected.cuotaVencida}</b> por cuota vencida,{" "}
                <b className="text-[#F4F5F7]">{data.rejected.limiteAlcanzado}</b> por límite de días
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
