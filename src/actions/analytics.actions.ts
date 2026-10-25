"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { GYM_TIMEZONE } from "@/lib/constants";
import type {
  ActionResponse,
  AnalyticsPeriodDays,
  AttendanceAnalytics,
  FrequencyBucket,
  HeatmapCell,
  HourlyPoint,
  WeekdayAttendance,
  WeeklyTrendPoint,
} from "@/types";

const ALLOWED_PERIODS: AnalyticsPeriodDays[] = [30, 90, 365];
const TREND_MIN_DAYS = 56; // 8 semanas: alcanza para comparar 4 vs 4
const FREQUENCY_WINDOW_DAYS = 28;

// -------------------------------------------------------------
// Fechas en hora local del gimnasio (el server puede correr en UTC)
// -------------------------------------------------------------

function localNow(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: GYM_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || "0";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function isoWeekday(date: string): number {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return day === 0 ? 7 : day;
}

function pctChange(value: number, base: number): number | null {
  if (base <= 0) return null;
  return Math.round(((value - base) / base) * 100);
}

const round1 = (n: number) => Math.round(n * 10) / 10;

// Visitas = primer ingreso HABILITADO de cada socio por día local, en [fromDate, toDate).
// El filtro grueso sobre "createdAt" permite usar el índice antes de convertir a hora local.
function visitsCte(fromDate: string, toDate: string) {
  return Prisma.sql`
    WITH local_checkins AS (
      SELECT "memberId", ("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE ${GYM_TIMEZONE} AS ts
      FROM "CheckIn"
      WHERE status = 'HABILITADO'
        AND "createdAt" >= ${fromDate}::date - INTERVAL '1 day'
        AND "createdAt" < ${toDate}::date + INTERVAL '1 day'
    ),
    visits AS (
      SELECT "memberId", ts::date AS d, min(ts) AS first_ts
      FROM local_checkins
      WHERE ts::date >= ${fromDate}::date AND ts::date < ${toDate}::date
      GROUP BY "memberId", ts::date
    )`;
}

export async function getAttendanceAnalytics(
  periodInput: number = 90
): Promise<ActionResponse<AttendanceAnalytics>> {
  try {
    const periodDays = (ALLOWED_PERIODS as number[]).includes(periodInput)
      ? (periodInput as AnalyticsPeriodDays)
      : 90;

    const now = new Date();
    const local = localNow(now);
    const today = local.date;
    const tomorrow = addDays(today, 1);
    const periodStart = addDays(today, -periodDays);
    const historyStart = addDays(today, -Math.max(periodDays, TREND_MIN_DAYS));
    const frequencyStart = addDays(today, -FREQUENCY_WINDOW_DAYS);

    const [heatmapRows, dailyRows, todayRows, frequencyRows, rejectedRows] = await Promise.all([
      prisma.$queryRaw<{ dow: number; hour: number; n: number }[]>`
        ${visitsCte(periodStart, today)}
        SELECT EXTRACT(ISODOW FROM first_ts)::int AS dow, EXTRACT(HOUR FROM first_ts)::int AS hour, count(*)::int AS n
        FROM visits GROUP BY 1, 2`,
      prisma.$queryRaw<{ day: string; n: number }[]>`
        ${visitsCte(historyStart, today)}
        SELECT to_char(d, 'YYYY-MM-DD') AS day, count(*)::int AS n
        FROM visits GROUP BY d`,
      prisma.$queryRaw<{ hour: number; n: number }[]>`
        ${visitsCte(today, tomorrow)}
        SELECT EXTRACT(HOUR FROM first_ts)::int AS hour, count(*)::int AS n
        FROM visits GROUP BY 1`,
      prisma.$queryRaw<{ days: number; members: number }[]>`
        ${visitsCte(frequencyStart, today)}
        SELECT days, count(*)::int AS members
        FROM (SELECT "memberId", count(*)::int AS days FROM visits GROUP BY 1) t
        GROUP BY days`,
      prisma.checkIn.groupBy({
        by: ["status"],
        _count: { _all: true },
        where: {
          status: { not: "HABILITADO" },
          createdAt: { gte: new Date(now.getTime() - periodDays * 86_400_000) },
        },
      }),
    ]);

    // --- Días abiertos y asistencia por día de la semana (solo el período elegido) ---
    // Un día cuenta como "abierto" si tuvo al menos una visita; así los feriados/cierres no bajan el promedio.
    const visitsByDay = new Map(dailyRows.map((r) => [r.day, r.n]));
    const openDaysByDow = new Array(8).fill(0);
    const visitsByDow = new Array(8).fill(0);
    for (const [day, n] of visitsByDay) {
      if (day < periodStart || n <= 0) continue;
      const dow = isoWeekday(day);
      openDaysByDow[dow]++;
      visitsByDow[dow] += n;
    }
    const openDays = openDaysByDow.reduce((a, b) => a + b, 0);
    const totalVisits = visitsByDow.reduce((a, b) => a + b, 0);
    const avgDailyVisits = openDays > 0 ? totalVisits / openDays : 0;

    const weekdays: WeekdayAttendance[] = [1, 2, 3, 4, 5, 6, 7].map((dow) => {
      if (openDaysByDow[dow] === 0) return { dow, avgVisits: null, pctVsAverage: null };
      const avg = visitsByDow[dow] / openDaysByDow[dow];
      return { dow, avgVisits: round1(avg), pctVsAverage: pctChange(avg, avgDailyVisits) };
    });

    // --- Mapa de calor: llegadas promedio por día y hora ---
    const heatmap: HeatmapCell[] = heatmapRows
      .filter((r) => openDaysByDow[r.dow] > 0)
      .map((r) => ({ dow: r.dow, hour: r.hour, avgArrivals: round1(r.n / openDaysByDow[r.dow]) }))
      .sort((a, b) => a.dow - b.dow || a.hour - b.hour);

    const peakSlots = [...heatmap].sort((a, b) => b.avgArrivals - a.avgArrivals).slice(0, 3);

    // Horas tranquilas: promedio por hora sobre todos los días abiertos, entre las horas con actividad.
    const arrivalsByHour = new Map<number, number>();
    for (const r of heatmapRows) arrivalsByHour.set(r.hour, (arrivalsByHour.get(r.hour) || 0) + r.n);
    const quietHours = [...arrivalsByHour.entries()]
      .map(([hour, n]) => ({ hour, avgArrivals: openDays > 0 ? round1(n / openDays) : 0 }))
      .sort((a, b) => a.avgArrivals - b.avgArrivals)
      .slice(0, 3)
      .sort((a, b) => a.hour - b.hour);

    // --- Hoy vs un día normal del mismo tipo ---
    const todayDow = isoWeekday(today);
    const typicalByHour = new Map(heatmap.filter((c) => c.dow === todayDow).map((c) => [c.hour, c.avgArrivals]));
    const todayByHour = new Map(todayRows.map((r) => [r.hour, r.n]));
    const activeHours = [...typicalByHour.keys(), ...todayByHour.keys()];
    const firstHour = activeHours.length ? Math.min(...activeHours) : 7;
    const lastHour = activeHours.length ? Math.max(...activeHours) : 22;
    const hourly: HourlyPoint[] = [];
    for (let h = firstHour; h <= lastHour; h++) {
      hourly.push({ hour: h, today: todayByHour.get(h) || 0, typical: typicalByHour.get(h) || 0 });
    }
    const visitsSoFar = todayRows.reduce((a, r) => a + r.n, 0);
    let typicalSoFar = 0;
    for (const [h, avg] of typicalByHour) {
      if (h < local.hour) typicalSoFar += avg;
      else if (h === local.hour) typicalSoFar += avg * (local.minute / 60);
    }

    // --- Tendencia semanal (semanas completas, lunes a domingo) ---
    const currentWeekStart = addDays(today, -(todayDow - 1));
    let weekStart = addDays(historyStart, (8 - isoWeekday(historyStart)) % 7);
    const weeklyTrend: WeeklyTrendPoint[] = [];
    while (weekStart < currentWeekStart) {
      let visits = 0;
      for (let i = 0; i < 7; i++) visits += visitsByDay.get(addDays(weekStart, i)) || 0;
      weeklyTrend.push({ weekStart, visits });
      weekStart = addDays(weekStart, 7);
    }
    const sumWeeks = (pts: WeeklyTrendPoint[]) => pts.reduce((a, p) => a + p.visits, 0);
    const trendPct =
      weeklyTrend.length >= 8 ? pctChange(sumWeeks(weeklyTrend.slice(-4)), sumWeeks(weeklyTrend.slice(-8, -4))) : null;

    // --- Frecuencia de los socios en las últimas 4 semanas ---
    const weeks = FREQUENCY_WINDOW_DAYS / 7;
    const bucketDefs = [
      { label: "Menos de 1 vez por semana", max: weeks - 1 },
      { label: "1 vez por semana", max: weeks * 2 - 1 },
      { label: "2 veces por semana", max: weeks * 3 - 1 },
      { label: "3 veces por semana", max: weeks * 4 - 1 },
      { label: "4 o más veces por semana", max: Infinity },
    ];
    const frequency: FrequencyBucket[] = bucketDefs.map((b) => ({ label: b.label, members: 0 }));
    let freqMembers = 0;
    let freqVisits = 0;
    for (const r of frequencyRows) {
      const idx = bucketDefs.findIndex((b) => r.days <= b.max);
      frequency[idx].members += r.members;
      freqMembers += r.members;
      freqVisits += r.days * r.members;
    }

    const rejectedCount = (status: string) => rejectedRows.find((r) => r.status === status)?._count._all || 0;

    return {
      success: true,
      data: {
        periodDays,
        totalVisits,
        openDays,
        avgDailyVisits: round1(avgDailyVisits),
        heatmap,
        peakSlots,
        quietHours,
        weekdays,
        today: {
          dow: todayDow,
          currentHour: local.hour,
          visitsSoFar,
          typicalSoFar: round1(typicalSoFar),
          pctVsTypical: pctChange(visitsSoFar, typicalSoFar),
          hourly,
        },
        weeklyTrend,
        trendPct,
        frequency,
        avgVisitsPerWeek: freqMembers > 0 ? round1(freqVisits / freqMembers / weeks) : null,
        rejected: {
          cuotaVencida: rejectedCount("CUOTA_VENCIDA"),
          limiteAlcanzado: rejectedCount("LIMITE_ALCANZADO"),
        },
      },
    };
  } catch (error) {
    console.error("[getAttendanceAnalytics] Error:", error);
    return { success: false, error: "No se pudieron calcular las métricas de asistencia" };
  }
}
