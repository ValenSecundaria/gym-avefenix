// Carga datos de PRUEBA para ver las métricas del dashboard con contenido.
//
// Uso:    npm run demo:seed      (borrar: npm run demo:clear)
//
// Todo lo que crea queda marcado: socios con notes = "[DEMO]" y DNI 99xxxxxx.
// Membresías, pagos e ingresos se borran en cascada al borrar esos socios.
// OJO: escribe en la base del DATABASE_URL del .env (hoy es la remota compartida).

import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const DEMO_NOTE = "[DEMO]";
const DEMO_DNI_PREFIX = "99";

const prisma = new PrismaClient();

const MEMBER_COUNT = 140;
const HISTORY_DAYS = 120;
const AR_UTC_OFFSET_HOURS = 3; // Argentina = UTC-3, sin horario de verano

// Peso de cada día de la semana (ISO: 1 = lunes ... 7 = domingo). Domingo cerrado.
const DOW_WEIGHT = { 1: 1.35, 2: 1.0, 3: 1.25, 4: 0.95, 5: 0.85, 6: 0.5, 7: 0 };
// Horario de llegada preferido: pico fuerte 18-20 hs, pico chico 8-9 hs.
const HOUR_WEIGHT = { 7: 4, 8: 8, 9: 6, 10: 4, 11: 3, 12: 3, 13: 2, 14: 1, 15: 2, 16: 4, 17: 7, 18: 12, 19: 13, 20: 9, 21: 4 };
const SATURDAY_HOURS = [9, 10, 11, 12];

const FIRST_NAMES = ["Juan", "María", "Lucas", "Sofía", "Martín", "Valentina", "Matías", "Camila", "Nicolás", "Julieta", "Tomás", "Agustina", "Facundo", "Florencia", "Santiago", "Micaela", "Joaquín", "Lucía", "Franco", "Rocío", "Gonzalo", "Carla", "Diego", "Paula", "Ezequiel", "Milagros"];
const LAST_NAMES = ["González", "Rodríguez", "Gómez", "Fernández", "López", "Díaz", "Martínez", "Pérez", "Romero", "Sánchez", "Álvarez", "Torres", "Ruiz", "Ramírez", "Flores", "Acosta", "Benítez", "Medina", "Herrera", "Suárez", "Aguirre", "Giménez"];

const rand = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
function weightedPick(weights) {
  const entries = Object.entries(weights);
  let r = Math.random() * entries.reduce((a, [, w]) => a + w, 0);
  for (const [k, w] of entries) if ((r -= w) <= 0) return Number(k);
  return Number(entries[entries.length - 1][0]);
}

// Fechas como "día local" (medianoche UTC usada solo como contenedor de Y-M-D).
function localToday() {
  const s = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }).format(new Date());
  return new Date(`${s}T00:00:00Z`);
}
const addDays = (d, n) => new Date(d.getTime() + n * 86_400_000);
const isoDow = (d) => (d.getUTCDay() === 0 ? 7 : d.getUTCDay());
const toInstant = (localDay, hour, minute) =>
  new Date(Date.UTC(localDay.getUTCFullYear(), localDay.getUTCMonth(), localDay.getUTCDate(), hour + AR_UTC_OFFSET_HOURS, minute));

async function ensurePlans() {
  let plans = await prisma.plan.findMany({ where: { isActive: true } });
  if (plans.length === 0) {
    // Mismos planes por defecto que crea la app (ensureDefaultPlansExist).
    await prisma.plan.createMany({
      data: [
        { name: "Pase Libre Mensual", category: "MENSUAL_LIBRE", allowedDaysPerWeek: null, durationDays: 30, price: 18500, isActive: true },
        { name: "Plan 3 Días por Semana", category: "MENSUAL_DIAS", allowedDaysPerWeek: 3, durationDays: 30, price: 14500, isActive: true },
        { name: "Pase Diario", category: "DIARIO", allowedDaysPerWeek: 1, durationDays: 1, price: 3500, isActive: true },
      ],
    });
    plans = await prisma.plan.findMany({ where: { isActive: true } });
  }
  const free = plans.find((p) => p.category === "MENSUAL_LIBRE");
  const limited = plans.find((p) => p.category === "MENSUAL_DIAS");
  if (!free || !limited) throw new Error("Faltan planes MENSUAL_LIBRE / MENSUAL_DIAS activos en la base.");
  return { free, limited };
}

async function main() {
  const existing = await prisma.member.count({ where: { notes: DEMO_NOTE, dni: { startsWith: DEMO_DNI_PREFIX } } });
  if (existing > 0) {
    console.log(`Ya hay ${existing} socios demo cargados. Corré "npm run demo:clear" primero.`);
    return;
  }

  const { free, limited } = await ensurePlans();
  const now = new Date();
  const today = localToday();
  const historyStart = addDays(today, -HISTORY_DAYS);

  const members = [];
  const memberships = [];
  const payments = [];
  const checkIns = [];

  for (let i = 0; i < MEMBER_COUNT; i++) {
    const id = randomUUID();
    const dni = `${DEMO_DNI_PREFIX}${String(100000 + i).padStart(6, "0")}`;
    const profile = Math.random();
    // ~10% dejó de venir hace 2-4 meses (ausentes), ~8% con la cuota vencida pero sigue viniendo (deudores).
    const type = profile < 0.1 ? "churned" : profile < 0.18 ? "debtor" : "regular";

    // Más altas en los últimos meses para que la tendencia muestre crecimiento.
    const joinOffset = Math.floor(HISTORY_DAYS * Math.sqrt(Math.random()));
    const joinDay =
      type === "churned" ? addDays(historyStart, randInt(0, 10))
      : type === "debtor" ? addDays(historyStart, randInt(0, 60))
      : addDays(historyStart, joinOffset - 20);
    const stopDay = type === "churned" ? addDays(today, -randInt(65, 105)) : null;

    const weeklyFreq = pick([1, 2, 2, 3, 3, 3, 4, 4, 5]);
    const plan = weeklyFreq <= 3 && Math.random() < 0.6 ? limited : free;
    const preferredHour = weightedPick(HOUR_WEIGHT);

    members.push({
      id,
      dni,
      fullName: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      phone: `11${randInt(20000000, 69999999)}`,
      notes: DEMO_NOTE,
      isActive: true,
      createdAt: toInstant(joinDay, 10, 0),
    });

    // Membresías de 30 días consecutivas, con su pago.
    // El deudor deja vencer la última hace 3-20 días; el ausente deja de renovar cuando deja de venir.
    const coverageEnd = type === "debtor" ? addDays(today, -randInt(3, 20)) : type === "churned" ? stopDay : addDays(today, 1);
    const periods = [];
    for (let start = joinDay; start < coverageEnd || periods.length === 0; start = addDays(start, plan.durationDays)) {
      const end = addDays(start, plan.durationDays);
      periods.push({ start, end });
      if (type === "debtor" && end >= coverageEnd) break;
    }
    if (type === "debtor") periods[periods.length - 1].end = coverageEnd;

    periods.forEach((p, idx) => {
      const membershipId = randomUUID();
      const validUntil = toInstant(p.end, 23, 59);
      const isLast = idx === periods.length - 1;
      memberships.push({
        id: membershipId,
        memberId: id,
        planId: plan.id,
        startDate: toInstant(p.start, 10, 0),
        validUntil,
        status: isLast && validUntil >= now ? "ACTIVA" : "VENCIDA",
      });
      payments.push({
        id: randomUUID(),
        memberId: id,
        membershipId,
        amount: plan.price,
        method: Math.random() < 0.55 ? "EFECTIVO" : "TRANSFERENCIA",
        paidAt: toInstant(p.start, randInt(8, 20), randInt(0, 59)),
      });
    });

    // Ingresos día por día.
    const lastActiveDay = stopDay || today;
    let weekKey = null;
    let weekCount = 0;
    for (let day = joinDay < historyStart ? historyStart : joinDay; day <= lastActiveDay; day = addDays(day, 1)) {
      const dow = isoDow(day);
      if (DOW_WEIGHT[dow] === 0) continue;

      const thisWeek = addDays(day, -(dow - 1)).getTime();
      if (thisWeek !== weekKey) {
        weekKey = thisWeek;
        weekCount = 0;
      }

      const p = Math.min(0.95, (weeklyFreq / 6) * DOW_WEIGHT[dow]);
      if (Math.random() > p) continue;

      const hour = dow === 6 ? pick(SATURDAY_HOURS) : Math.min(21, Math.max(7, preferredHour + pick([-1, 0, 0, 0, 1])));
      const minute = randInt(0, 59);
      const at = toInstant(day, hour, minute);
      if (at > now) continue;

      const period = periods.find((pp) => toInstant(pp.start, 0, 0) <= at && at <= toInstant(pp.end, 23, 59));
      let status = "HABILITADO";
      if (!period) {
        status = "CUOTA_VENCIDA";
      } else if (plan.allowedDaysPerWeek && weekCount >= plan.allowedDaysPerWeek) {
        if (Math.random() > 0.3) continue; // la mayoría ni lo intenta
        status = "LIMITE_ALCANZADO";
      }
      if (status === "HABILITADO") weekCount++;
      checkIns.push({ id: randomUUID(), memberId: id, status, isSynced: true, createdAt: at });
    }
  }

  console.log(`Cargando ${members.length} socios, ${memberships.length} membresías, ${payments.length} pagos, ${checkIns.length} ingresos...`);
  await prisma.member.createMany({ data: members });
  await prisma.membership.createMany({ data: memberships });
  await prisma.payment.createMany({ data: payments });
  for (let i = 0; i < checkIns.length; i += 1000) {
    await prisma.checkIn.createMany({ data: checkIns.slice(i, i + 1000) });
  }
  console.log("Listo. Para borrarlos: npm run demo:clear");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
