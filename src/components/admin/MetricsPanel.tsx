"use client";

import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, ArrowRight, Ban, CalendarClock, DoorOpen, Lightbulb, Loader2, Moon, TrendingDown, TrendingUp } from "lucide-react";
import { getAttendanceAnalytics } from "@/actions/analytics.actions";
import type { AnalyticsPeriodDays, AttendanceAnalytics, DashboardStats, HeatmapCell } from "@/types";

const DAY_NAMES = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const DAY_SHORT = ["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const PERIODS: { days: AnalyticsPeriodDays; label: string }[] = [
  { days: 30, label: "Último mes" },
  { days: 90, label: "Últimos 3 meses" },
  { days: 365, label: "Último año" },
];

const C = {
  orange: "var(--fx-orange)",
  surface: "var(--fx-surface)",
  base: "var(--fx-base)",
  border: "var(--fx-border)",
  text: "var(--fx-text)",
  muted: "var(--fx-muted)",
  grid: "var(--fx-hover)",
  green: "var(--fx-green)",
  red: "var(--fx-red)",
};

const hourLabel = (h: number) => `${String(h).padStart(2, "0")} hs`;
const slotLabel = (h: number) => `${h} a ${h + 1} hs`;
const fmtWeek = (d: string) => {
  const [, m, day] = d.split("-");
  return `${day}/${m}`;
};

// Los promedios se muestran redondeados o en rangos de 5: "entre 20 y 25" se lee mejor que "23,4".
const roundPct = (p: number) => Math.round(p / 5) * 5;
const fmtPct = (p: number) => {
  const r = roundPct(p);
  return `${r > 0 ? "+" : ""}${r}%`;
};
function approx(n: number): string {
  if (n < 1) return "menos de 1";
  if (n < 5) return String(Math.round(n));
  if (n < 10) return `unos ${Math.round(n)}`;
  const lo = Math.floor(n / 5) * 5;
  return `entre ${lo} y ${lo + 5}`;
}
function people(n: number, noun = "socios"): string {
  if (n < 1) return `menos de 1 ${noun.replace(/s$/, "")}`;
  if (Math.round(n) === 1 && n < 5) return `1 ${noun.replace(/s$/, "")}`;
  return `${approx(n)} ${noun}`;
}
// Valores exactos (conteos de hoy) quedan enteros; promedios van aproximados.
const fmtValue = (n: number) => (Number.isInteger(n) ? String(n) : approx(n));

function buildInsights(d: AttendanceAnalytics): string[] {
  const out: string[] = [];
  const peak = d.peakSlots[0];
  if (peak) {
    out.push(`El momento de más gente es el ${DAY_NAMES[peak.dow].toLowerCase()} de ${slotLabel(peak.hour)}: llegan ${people(peak.avgArrivals)} en esa hora.`);
  }
  const ranked = d.weekdays.filter((w) => w.pctVsAverage !== null).sort((a, b) => b.pctVsAverage! - a.pctVsAverage!);
  const busy = ranked.filter((w) => w.pctVsAverage! >= 10).slice(0, 2);
  if (busy.length) {
    const names = busy.map((w) => DAY_NAMES[w.dow].toLowerCase()).join(" y los ");
    const pct = roundPct(busy.reduce((a, w) => a + w.pctVsAverage!, 0) / busy.length);
    out.push(`Los ${names} viene un ${pct}% más de gente que un día promedio.`);
  }
  const slow = ranked[ranked.length - 1];
  if (slow && slow.pctVsAverage! <= -10) {
    out.push(`El ${DAY_NAMES[slow.dow].toLowerCase()} es el día más tranquilo: viene un ${Math.abs(roundPct(slow.pctVsAverage!))}% menos que un día promedio.`);
  }
  if (d.quietHours.length) {
    out.push(`Los horarios más vacíos son ${d.quietHours.map((q) => hourLabel(q.hour)).join(", ")}. Buenos para clases nuevas o promociones.`);
  }
  if (d.trendPct !== null && roundPct(d.trendPct) !== 0) {
    out.push(
      d.trendPct > 0
        ? `Viene más gente: las últimas 4 semanas hubo un ${roundPct(d.trendPct)}% más de visitas que en las 4 anteriores.`
        : `Viene menos gente: las últimas 4 semanas hubo un ${Math.abs(roundPct(d.trendPct))}% menos de visitas que en las 4 anteriores.`
    );
  }
  if (d.avgVisitsPerWeek !== null) {
    const v = Math.max(1, Math.round(d.avgVisitsPerWeek));
    out.push(`Cada socio que viene entrena, en promedio, ${v === 1 ? "1 vez" : `unas ${v} veces`} por semana.`);
  }
  return out;
}

function Card({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl bg-fx-base border border-fx-border p-5 flex flex-col gap-4 ${className}`}>
      <div>
        <h3 className="text-base font-bold text-fx-text">{title}</h3>
        {subtitle && <p className="text-xs text-fx-muted mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

type TileTone = "default" | "accent" | "danger" | "warning";
const TONE: Record<TileTone, { border: string; value: string; icon: string }> = {
  default: { border: "border-fx-border", value: "text-fx-text", icon: "text-fx-orange" },
  accent: { border: "border-fx-orange/50", value: "text-fx-text", icon: "text-fx-orange" },
  danger: { border: "border-fx-red/50", value: "text-fx-red", icon: "text-fx-red" },
  warning: { border: "border-fx-amber/50", value: "text-fx-amber", icon: "text-fx-amber" },
};

function Tile({
  icon,
  label,
  value,
  detail,
  tone = "default",
  onClick,
  actionLabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: React.ReactNode;
  tone?: TileTone;
  onClick?: () => void;
  actionLabel?: string;
}) {
  const t = TONE[tone];
  const body = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs text-fx-muted font-bold uppercase tracking-wider">{label}</span>
        <span className={t.icon}>{icon}</span>
      </div>
      <div className={`text-3xl font-extrabold tracking-tight ${t.value}`}>{value}</div>
      <div className="text-xs text-fx-muted">{detail}</div>
      {onClick && actionLabel && (
        <span className="mt-auto inline-flex items-center gap-1 text-xs font-bold text-fx-text">
          {actionLabel} <ArrowRight className="w-3.5 h-3.5" />
        </span>
      )}
    </>
  );
  const cls = `p-5 rounded-xl bg-fx-base border ${t.border} flex flex-col gap-2 text-left`;
  return onClick ? (
    <button type="button" onClick={onClick} className={`${cls} hover:bg-fx-hover transition-colors cursor-pointer`}>
      {body}
    </button>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function Delta({ pct, suffix }: { pct: number | null; suffix: string }) {
  if (pct === null) return <span>Sin datos suficientes para comparar</span>;
  const up = pct >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 font-bold ${up ? "text-fx-green" : "text-fx-red"}`}>
      <Icon className="w-3.5 h-3.5" />
      {fmtPct(pct)} <span className="font-normal text-fx-muted">{suffix}</span>
    </span>
  );
}

// Aclara qué tarjetas usan una ventana fija en vez del período elegido.
function FixedWindow({ label }: { label: string }) {
  return (
    <span className="self-start px-2 py-0.5 rounded-md bg-fx-surface border border-fx-border text-[11px] font-semibold text-fx-muted">
      Siempre: {label}
    </span>
  );
}

function ChartTooltip({ active, payload, label, labelFormatter }: { active?: boolean; payload?: { name: string; value: number; color?: string }[]; label?: string | number; labelFormatter: (l: string | number) => string }) {
  if (!active || !payload?.length || label === undefined) return null;
  return (
    <div className="rounded-lg bg-fx-surface border border-fx-border px-3 py-2 text-xs shadow-lg">
      <div className="font-bold text-fx-text mb-1">{labelFormatter(label)}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-fx-muted">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: p.color }} />
          <span>{p.name}:</span>
          <span className="font-mono font-bold text-fx-text">{fmtValue(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// "Horarios populares" (como Google Maps): se elige un día y se ven las llegadas por hora.
// Eje de horas y escala fijos para todos los días, así al cambiar de día las barras se comparan a ojo.
function HoursByDay({ cells, todayDow }: { cells: HeatmapCell[]; todayDow: number }) {
  const daysWithData = new Set(cells.filter((c) => c.avgArrivals > 0).map((c) => c.dow));
  const busiestDow = [...cells].sort((a, b) => b.avgArrivals - a.avgArrivals)[0]?.dow ?? 1;
  const [pickedDow, setPickedDow] = useState<number | null>(null);
  const dow = pickedDow ?? (daysWithData.has(todayDow) ? todayDow : busiestDow);

  const hours = cells.map((c) => c.hour);
  const minH = hours.length ? Math.min(...hours) : 7;
  const maxH = hours.length ? Math.max(...hours) : 22;
  const yMax = Math.max(...cells.map((c) => c.avgArrivals), 1);
  const byHour = new Map(cells.filter((c) => c.dow === dow).map((c) => [c.hour, c.avgArrivals]));
  const series = Array.from({ length: maxH - minH + 1 }, (_, i) => ({ hour: minH + i, value: byHour.get(minH + i) || 0 }));

  const active = series.filter((s) => s.value > 0);
  const peak = active.length ? active.reduce((a, b) => (b.value > a.value ? b : a)) : null;
  const quiet = active.length > 2 ? active.reduce((a, b) => (b.value < a.value ? b : a)) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Día de la semana">
        {[1, 2, 3, 4, 5, 6, 7].map((d) => {
          const has = daysWithData.has(d);
          const selected = d === dow;
          return (
            <button
              key={d}
              type="button"
              onClick={() => setPickedDow(d)}
              disabled={!has}
              aria-pressed={selected}
              title={has ? DAY_NAMES[d] : `${DAY_NAMES[d]}: sin actividad en el período`}
              className={`min-h-[40px] min-w-[52px] px-3 rounded-xl text-xs font-bold transition-all ${
                selected
                  ? "bg-fx-text text-fx-base"
                  : has
                    ? "bg-fx-surface border border-fx-border text-fx-muted hover:text-fx-text cursor-pointer"
                    : "bg-fx-surface border border-fx-border text-fx-muted opacity-40 cursor-not-allowed"
              }`}
            >
              {DAY_SHORT[d]}
              {d === todayDow && <span className="sr-only"> (hoy)</span>}
              {d === todayDow && <span aria-hidden className="ml-1 text-fx-orange">•</span>}
            </button>
          );
        })}
      </div>

      <p className="text-sm text-fx-muted min-h-[20px]" aria-live="polite">
        {peak ? (
          <>
            {DAY_NAMES[dow]}: el momento de más gente es de <b className="text-fx-text">{slotLabel(peak.hour)}</b> ({people(peak.value)}
            {" "}llegan en esa hora).
            {quiet && quiet.hour !== peak.hour && (
              <>
                {" "}El más tranquilo, de <b className="text-fx-text">{slotLabel(quiet.hour)}</b>.
              </>
            )}
          </>
        ) : (
          <>{DAY_NAMES[dow]}: sin actividad en el período.</>
        )}
      </p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series} margin={{ top: 22, right: 8, left: -20, bottom: 0 }} barCategoryGap={2}>
            <CartesianGrid stroke={C.grid} vertical={false} />
            <XAxis dataKey="hour" tickFormatter={(h) => `${h}`} tick={{ fill: C.muted, fontSize: 11 }} axisLine={{ stroke: C.border }} tickLine={false} />
            <YAxis allowDecimals={false} domain={[0, Math.ceil(yMax)]} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(128,128,128,0.08)" }}
              content={({ active: isActive, payload }) => {
                const p = payload?.[0]?.payload as { hour: number; value: number } | undefined;
                if (!isActive || !p) return null;
                return (
                  <div className="rounded-lg bg-fx-surface border border-fx-border px-3 py-2 text-xs shadow-lg">
                    <div className="font-bold text-fx-text">{DAY_NAMES[dow]} de {slotLabel(p.hour)}</div>
                    <div className="text-fx-muted">
                      {p.value > 0 ? <>Llegan <b className="text-fx-text">{people(p.value)}</b></> : "Sin llegadas"}
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false}>
              {series.map((s) => (
                <Cell key={s.hour} fill={peak && s.hour === peak.hour ? C.orange : "rgba(249,87,22,0.35)"} />
              ))}
              <LabelList
                dataKey="value"
                position="top"
                content={({ x, y, width, index }) => {
                  const s = typeof index === "number" ? series[index] : undefined;
                  if (!s || !peak || s.hour !== peak.hour) return null;
                  return (
                    <text x={Number(x) + Number(width) / 2} y={Number(y) - 6} textAnchor="middle" fill={C.text} fontSize={12} fontWeight={700}>
                      {s.value < 1 ? "<1" : Math.round(s.value)}
                    </text>
                  );
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-fx-muted">
        Promedio de socios que llegan en cada hora ese día de la semana. Pasá el mouse por una barra para ver el detalle.
      </p>
    </div>
  );
}

function SectionTitle({ title, subtitle, right }: { title: string; subtitle: string; right?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-extrabold text-fx-text">{title}</h2>
        <p className="text-xs text-fx-muted mt-0.5">{subtitle}</p>
      </div>
      {right}
    </div>
  );
}

interface MetricsPanelProps {
  stats: DashboardStats;
  onGoToTab: (tab: "LIVE_FEED" | "DEBTORS" | "ABSENT") => void;
}

export function MetricsPanel({ stats, onGoToTab }: MetricsPanelProps) {
  const [period, setPeriod] = useState<AnalyticsPeriodDays>(90);
  const [data, setData] = useState<AttendanceAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedPeriod, setLoadedPeriod] = useState<AnalyticsPeriodDays | null>(null);
  const loading = loadedPeriod !== period;

  useEffect(() => {
    let cancelled = false;
    getAttendanceAnalytics(period)
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) {
          setData(res.data);
          setError(null);
        } else {
          setError(res.error || "No se pudieron cargar las métricas");
        }
      })
      .catch(() => {
        if (!cancelled) setError("No se pudo conectar con el servidor para cargar las métricas");
      })
      .finally(() => {
        if (!cancelled) setLoadedPeriod(period);
      });
    return () => {
      cancelled = true;
    };
  }, [period]);

  const periodLabel = (d: AnalyticsPeriodDays) => PERIODS.find((p) => p.days === d)?.label.toLowerCase() || "";
  const periodSelector = (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Período del análisis">
      {loading && <Loader2 className="w-4 h-4 animate-spin text-fx-orange" aria-label="Cargando" />}
      {PERIODS.map((p) => (
        <button
          key={p.days}
          type="button"
          onClick={() => setPeriod(p.days)}
          aria-pressed={period === p.days}
          className={`min-h-[40px] px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            period === p.days ? "bg-fx-text text-fx-base" : "bg-fx-base border border-fx-border text-fx-muted hover:text-fx-text"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );

  const todayName = data ? DAY_NAMES[data.today.dow].toLowerCase() : "";
  const insights = data ? buildInsights(data) : [];
  const maxWeekday = data ? Math.max(...data.weekdays.map((w) => w.avgVisits || 0)) : 0;
  const freqTotal = data ? data.frequency.reduce((a, f) => a + f.members, 0) : 0;
  // Si el período pedido falló, los datos visibles son de otro período: se avisa en vez de mostrarlos como actuales.
  const staleData = Boolean(data && error && data.periodDays !== period);

  return (
    <div className="flex flex-col gap-8">
      {/* ===== 1. SITUACIÓN DEL LOCAL (tiempo real) ===== */}
      <section className="flex flex-col gap-4">
        <SectionTitle title="Hoy en el gimnasio" subtitle="Situación del día y de las cuotas, en tiempo real" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Tile
            tone="accent"
            icon={<DoorOpen className="w-5 h-5" />}
            label="Vinieron hoy"
            value={`${stats.todayCheckIns}`}
            detail={
              data && data.today.typicalSoFar > 0 ? (
                <span className="flex flex-col gap-1">
                  <span>Un {todayName} normal a esta hora: {people(data.today.typicalSoFar)}</span>
                  <Delta pct={data.today.pctVsTypical} suffix={`vs. un ${todayName} normal`} />
                </span>
              ) : (
                "Ingresos registrados hoy"
              )
            }
            onClick={() => onGoToTab("LIVE_FEED")}
            actionLabel="Ver ingresos"
          />
          <Tile
            tone="danger"
            icon={<AlertTriangle className="w-5 h-5" />}
            label="No pagaron"
            value={`${stats.debtorsCount}`}
            detail="Cuota vencida y siguen viniendo"
            onClick={() => onGoToTab("DEBTORS")}
            actionLabel="Ver y cobrar"
          />
          <Tile
            tone="warning"
            icon={<CalendarClock className="w-5 h-5" />}
            label="Vencen esta semana"
            value={`${stats.expiringSoonCount}`}
            detail={`Al día, vencen en 7 días • ${stats.absentCount} dejaron de venir`}
            onClick={() => onGoToTab("ABSENT")}
            actionLabel="Ver ausentes"
          />
        </div>
      </section>

      {/* ===== 2. ANÁLISIS GENERAL (según el período elegido) ===== */}
      <section className="flex flex-col gap-4">
        <SectionTitle
          title="Análisis de asistencia"
          subtitle={
            data && data.totalVisits > 0
              ? `${data.totalVisits.toLocaleString("es-AR")} visitas en ${data.openDays} días con actividad • vienen ${people(data.avgDailyVisits)} por día`
              : "Picos de gente, días y horarios"
          }
          right={periodSelector}
        />

        {error && (
          <div role="alert" className="p-4 rounded-xl bg-fx-red/10 border border-fx-red/40 text-sm text-fx-red font-bold">
            {error}.{" "}
            {staleData && data && (
              <span className="font-normal">Abajo se muestran los datos de {periodLabel(data.periodDays)}, no de {periodLabel(period)}.</span>
            )}
          </div>
        )}

        {!data ? (
          !error && <div className="p-10 text-center text-sm text-fx-muted">Calculando métricas de asistencia...</div>
        ) : data.totalVisits === 0 ? (
          <div className="p-10 text-center text-sm text-fx-muted">Todavía no hay ingresos registrados en este período.</div>
        ) : (
          <div className={`flex flex-col gap-5 transition-opacity ${loading || staleData ? "opacity-60" : ""}`}>
            <Card title="¿A qué hora viene la gente?" subtitle="Elegí un día para ver cuántos socios llegan en cada hora">
              <HoursByDay cells={data.heatmap} todayDow={data.today.dow} />
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Card title="Cuándo se llena" subtitle="Los 3 horarios con más gente de la semana">
                <ol className="flex flex-col gap-2.5">
                  {data.peakSlots.map((p, i) => (
                    <li key={`${p.dow}-${p.hour}`} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-3 text-fx-text">
                        <span className="w-6 h-6 rounded-full bg-fx-orange/15 border border-fx-orange/40 text-fx-orange text-xs font-bold flex items-center justify-center">{i + 1}</span>
                        {DAY_NAMES[p.dow]} de {slotLabel(p.hour)}
                      </span>
                      <span className="text-fx-muted">{people(p.avgArrivals)}</span>
                    </li>
                  ))}
                </ol>
              </Card>
              <Card title="Cuándo está tranquilo" subtitle="Las horas con menos gente, cualquier día">
                <ol className="flex flex-col gap-2.5">
                  {data.quietHours.map((q) => (
                    <li key={q.hour} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-3 text-fx-text">
                        <Moon className="w-4 h-4 text-fx-muted" />
                        De {slotLabel(q.hour)}
                      </span>
                      <span className="text-fx-muted">{people(q.avgArrivals)} por día</span>
                    </li>
                  ))}
                </ol>
              </Card>

              <Card title="Asistencia por día de la semana" subtitle="Socios por día • el más alto resaltado">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.weekdays.map((w) => ({ ...w, name: DAY_SHORT[w.dow], value: w.avgVisits || 0 }))} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke={C.grid} vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 11 }} axisLine={{ stroke: C.border }} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: "rgba(128,128,128,0.08)" }}
                        content={({ active, payload }) => {
                          const w = payload?.[0]?.payload as (typeof data.weekdays)[number] | undefined;
                          if (!active || !w) return null;
                          return (
                            <div className="rounded-lg bg-fx-surface border border-fx-border px-3 py-2 text-xs shadow-lg">
                              <div className="font-bold text-fx-text">{DAY_NAMES[w.dow]}</div>
                              {w.avgVisits === null ? (
                                <div className="text-fx-muted">Sin actividad en el período</div>
                              ) : (
                                <>
                                  <div className="text-fx-muted">Vienen <b className="text-fx-text">{people(w.avgVisits)}</b> por día</div>
                                  {w.pctVsAverage !== null && <div className="text-fx-muted">{fmtPct(w.pctVsAverage)} vs. un día promedio</div>}
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

              <Card title={`Hoy vs. un ${todayName} normal`} subtitle="Llegadas por hora. Barras: hoy • Línea: promedio de ese día">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data.today.hourly} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke={C.grid} vertical={false} />
                      <XAxis dataKey="hour" tickFormatter={(h) => `${h}`} tick={{ fill: C.muted, fontSize: 11 }} axisLine={{ stroke: C.border }} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: "rgba(128,128,128,0.08)" }} content={<ChartTooltip labelFormatter={(l) => slotLabel(Number(l))} />} />
                      <Bar dataKey="today" name="Hoy" fill={C.orange} radius={[4, 4, 0, 0]} maxBarSize={24} />
                      <Line dataKey="typical" name={`Un ${todayName} normal`} stroke={C.text} strokeWidth={2} strokeDasharray="4 3" dot={false} type="monotone" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-4 text-xs text-fx-muted">
                  <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-fx-orange" />Hoy</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed border-fx-text" />Un {todayName} normal</span>
                </div>
              </Card>

              <Card title="Tendencia semanal" subtitle="Total de visitas por semana (semanas completas)">
                <FixedWindow label="al menos las últimas 8 semanas" />
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
                    <div className="h-full flex items-center justify-center text-xs text-fx-muted">Hacen falta al menos 2 semanas completas de datos.</div>
                  )}
                </div>
              </Card>

              <Card title="¿Cada cuánto vienen los socios?" subtitle="Socios según cuántas veces por semana entrenan">
                <FixedWindow label="últimas 4 semanas" />
                <div className="flex flex-col gap-3">
                  {data.frequency.map((f) => {
                    const pct = freqTotal > 0 ? Math.round((f.members / freqTotal) * 100) : 0;
                    return (
                      <div key={f.label} className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-fx-text">{f.label}</span>
                          <span className="font-mono text-fx-muted">{f.members} socios • {pct}%</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-fx-surface border border-fx-border overflow-hidden">
                          <div className="h-full rounded-full bg-fx-orange" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-3 border-t border-fx-border flex items-start gap-2 text-xs text-fx-muted">
                  <Ban className="w-4 h-4 text-fx-red shrink-0" />
                  <span>
                    Accesos rechazados en el período: <b className="text-fx-text">{data.rejected.cuotaVencida}</b> por cuota vencida,{" "}
                    <b className="text-fx-text">{data.rejected.limiteAlcanzado}</b> por límite de días
                  </span>
                </div>
              </Card>
            </div>

            {insights.length > 0 && (
              <Card title="Conclusiones" subtitle="Resumen automático del período elegido">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                  {insights.map((t) => (
                    <li key={t} className="flex items-start gap-2 text-sm text-fx-muted">
                      <Lightbulb className="w-4 h-4 text-fx-orange shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
