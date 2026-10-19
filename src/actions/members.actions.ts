"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { deleteMemberPhotoFromDisk, saveMemberPhotoToDisk } from "@/lib/photo-storage";
import { hasActionSession } from "@/lib/auth/require-session";
import { getMemberPhotoUrl } from "@/lib/utils";
import { resolveSafePhotoPath } from "@/lib/security/safe-path";
import {
  createMemberSchema,
  updateMemberSchema,
  type CreateMemberInput,
  type UpdateMemberInput,
} from "@/lib/validations/member.schema";
import type { ActionResponse, MemberDetail, MemberListItem, MembershipStatusType, PlanOption } from "@/types";

export async function ensureDefaultPlansExist(): Promise<void> {
  const count = await prisma.plan.count();
  if (count > 0) return;
  await prisma.plan.createMany({
    data: [
      { name: "Pase Libre Mensual", category: "MENSUAL_LIBRE", allowedDaysPerWeek: null, durationDays: 30, price: 18500, isActive: true },
      { name: "Plan 3 Días por Semana", category: "MENSUAL_DIAS", allowedDaysPerWeek: 3, durationDays: 30, price: 14500, isActive: true },
      { name: "Pase Diario", category: "DIARIO", allowedDaysPerWeek: 1, durationDays: 1, price: 3500, isActive: true },
    ],
  });
}

export async function getPlans(): Promise<ActionResponse<PlanOption[]>> {
  try {
    await ensureDefaultPlansExist();
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: "desc" },
    });
    return {
      success: true,
      data: plans.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        allowedDaysPerWeek: p.allowedDaysPerWeek,
        durationDays: p.durationDays,
        price: Number(p.price),
      })),
    };
  } catch (error) {
    console.error("[getPlans] Error:", error);
    return { success: false, error: "No se pudieron obtener los planes del gimnasio" };
  }
}

type CreateMemberRecordResult =
  | { kind: "created"; data: MemberListItem }
  | { kind: "duplicate"; existingFullName: string }
  | { kind: "inactive"; existingFullName: string }
  | { kind: "invalid"; error: string };

function isUniqueConstraintError(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: unknown }).code === "P2002";
}

// Alta completa (socio + membresía + pago inicial). La unicidad del DNI en la base es la garantía
// final contra duplicados: si dos altas del mismo DNI llegan a la vez, la segunda termina en "duplicate".
async function createMemberRecord(input: CreateMemberInput, startDate: Date): Promise<CreateMemberRecordResult> {
  const parsed = createMemberSchema.safeParse(input);
  if (!parsed.success) {
    return { kind: "invalid", error: parsed.error.issues[0]?.message || "Datos del socio inválidos" };
  }

  const { fullName, dni, phone, planId, paymentMethod, photoBase64, notes } = parsed.data;

  if (!resolveSafePhotoPath(dni)) {
    return { kind: "invalid", error: "Identificador inválido" };
  }

  const existing = await prisma.member.findUnique({ where: { dni } });
  if (existing) {
    return existing.isActive
      ? { kind: "duplicate", existingFullName: existing.fullName }
      : { kind: "inactive", existingFullName: existing.fullName };
  }

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) return { kind: "invalid", error: "El plan seleccionado no existe" };

  let photoFilename: string | null = null;
  if (photoBase64 && photoBase64.trim().length > 0) {
    photoFilename = await saveMemberPhotoToDisk(dni, photoBase64);
  }

  const validUntil = new Date(startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

  let created;
  try {
    created = await prisma.$transaction(async (tx) => {
      const member = await tx.member.create({
        data: { dni, fullName, phone: phone || null, photoFilename, notes: notes || null, isActive: true },
      });
      const membership = await tx.membership.create({
        data: { memberId: member.id, planId: plan.id, startDate, validUntil, status: "ACTIVA" },
      });
      await tx.payment.create({
        data: {
          memberId: member.id,
          membershipId: membership.id,
          amount: plan.price,
          method: paymentMethod,
          notes: notes || `Alta inicial - ${plan.name}`,
          paidAt: startDate,
        },
      });
      return { member, membership };
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      const winner = await prisma.member.findUnique({ where: { dni } });
      return { kind: "duplicate", existingFullName: winner?.fullName ?? fullName };
    }
    throw error;
  }

  return {
    kind: "created",
    data: {
      id: created.member.id,
      dni: created.member.dni,
      fullName: created.member.fullName,
      phone: created.member.phone,
      photoFilename: created.member.photoFilename,
      photoUrl: getMemberPhotoUrl(created.member.dni, created.member.photoFilename),
      isActive: created.member.isActive,
      planName: plan.name,
      membershipStatus: "ACTIVA",
      validUntil: created.membership.validUntil.toISOString(),
    },
  };
}

export async function createMember(
  input: CreateMemberInput
): Promise<ActionResponse<MemberListItem>> {
  try {
    const result = await createMemberRecord(input, new Date());
    if (result.kind === "invalid") return { success: false, error: result.error };
    if (result.kind === "duplicate") {
      return { success: false, error: `Ya existe un socio registrado con el DNI ${input.dni}` };
    }
    if (result.kind === "inactive") {
      return {
        success: false,
        error: `El DNI ${input.dni} es de ${result.existingFullName}, que está dado de baja. Reactivalo desde Socios → Dados de baja.`,
      };
    }
    revalidatePath("/admin");
    return { success: true, data: result.data };
  } catch (error) {
    console.error("[createMember] Error:", error);
    return { success: false, error: "No se pudo registrar el socio. Verifique los datos e intente nuevamente." };
  }
}

// -------------------------------------------------------------
// SINCRONIZACIÓN EN LOTE DE ALTAS HECHAS SIN INTERNET
// -------------------------------------------------------------

const MAX_SYNC_BATCH = 25;
const MAX_OFFLINE_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export interface PendingMemberPayload {
  clientId: string;
  createdAt: number; // epoch ms en que se cargó el alta en la PC (sin conexión)
  input: CreateMemberInput;
}

export type PendingMemberSyncStatus =
  | "created" // se dio de alta ahora
  | "already_synced" // ya estaba en la base con el mismo nombre (un envío anterior llegó aunque no hubo respuesta)
  | "conflict" // el DNI ya pertenece a otra persona
  | "invalid" // datos rechazados: no tiene sentido reintentar
  | "retry"; // error transitorio del servidor: se reintenta en la próxima sincronización

export interface PendingMemberSyncResult {
  clientId: string;
  status: PendingMemberSyncStatus;
  message?: string;
}

function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export async function syncPendingMembers(
  items: PendingMemberPayload[]
): Promise<ActionResponse<PendingMemberSyncResult[]>> {
  if (!Array.isArray(items) || items.length > MAX_SYNC_BATCH) {
    return { success: false, error: "Lote de sincronización inválido" };
  }

  const results: PendingMemberSyncResult[] = [];
  const seenDnis = new Set<string>();
  let anyCreated = false;

  // Secuencial a propósito: cada alta es una transacción y el orden de carga se respeta.
  for (const item of items) {
    const clientId = typeof item?.clientId === "string" ? item.clientId.slice(0, 64) : "";
    if (!clientId || !item.input) {
      results.push({ clientId, status: "invalid", message: "Registro pendiente corrupto" });
      continue;
    }

    const dni = String(item.input.dni ?? "").trim();
    if (seenDnis.has(dni)) {
      results.push({ clientId, status: "conflict", message: `DNI ${dni} repetido dentro del mismo lote` });
      continue;
    }
    seenDnis.add(dni);

    // La fecha de alta es la de la carga offline (no la de la sincronización), acotada a valores razonables.
    const now = Date.now();
    const createdAt = Number(item.createdAt);
    const startMs =
      Number.isFinite(createdAt) && createdAt <= now && createdAt >= now - MAX_OFFLINE_AGE_MS ? createdAt : now;

    try {
      const result = await createMemberRecord(item.input, new Date(startMs));
      if (result.kind === "created") {
        anyCreated = true;
        results.push({ clientId, status: "created" });
      } else if (result.kind === "invalid") {
        results.push({ clientId, status: "invalid", message: result.error });
      } else if (result.kind === "inactive") {
        results.push({
          clientId,
          status: "conflict",
          message: `El DNI ${dni} es de ${result.existingFullName}, dado de baja: reactivalo desde Socios`,
        });
      } else if (normalizeName(result.existingFullName) === normalizeName(item.input.fullName)) {
        results.push({ clientId, status: "already_synced" });
      } else {
        results.push({
          clientId,
          status: "conflict",
          message: `El DNI ${dni} ya está registrado a nombre de ${result.existingFullName}`,
        });
      }
    } catch (error) {
      console.error("[syncPendingMembers] Error:", error);
      results.push({ clientId, status: "retry", message: "Error temporal del servidor" });
    }
  }

  if (anyCreated) revalidatePath("/admin");
  return { success: true, data: results };
}

const searchMemberSchema = z
  .string()
  .trim()
  .max(100, "El término de búsqueda no puede superar los 100 caracteres")
  .optional();

const memberWithLatestMembership = {
  memberships: { orderBy: { validUntil: "desc" as const }, take: 1, include: { plan: true } },
};

type MemberWithLatestMembership = Prisma.MemberGetPayload<{ include: typeof memberWithLatestMembership }>;

function toMemberListItem(m: MemberWithLatestMembership, now: Date): MemberListItem {
  const latest = m.memberships[0];
  const status: MembershipStatusType | "SIN_MEMBRESIA" = latest
    ? latest.status === "ACTIVA" && latest.validUntil >= now ? "ACTIVA" : "VENCIDA"
    : "SIN_MEMBRESIA";
  return {
    id: m.id,
    dni: m.dni,
    fullName: m.fullName,
    phone: m.phone,
    photoFilename: m.photoFilename,
    photoUrl: getMemberPhotoUrl(m.dni, m.photoFilename),
    isActive: m.isActive,
    planName: latest?.plan.name || "Sin plan",
    membershipStatus: status,
    validUntil: latest ? latest.validUntil.toISOString() : null,
  };
}

export async function getMembers(
  search?: string,
  options: { inactive?: boolean } = {}
): Promise<ActionResponse<MemberListItem[]>> {
  try {
    const parsedSearch = searchMemberSchema.safeParse(search);
    if (!parsedSearch.success) {
      return {
        success: false,
        error: parsedSearch.error.issues[0]?.message || "Término de búsqueda inválido",
      };
    }
    const cleanSearch = parsedSearch.data || undefined;
    const members = await prisma.member.findMany({
      where: {
        isActive: options.inactive !== true,
        ...(cleanSearch
          ? { OR: [{ fullName: { contains: cleanSearch, mode: "insensitive" } }, { dni: { contains: cleanSearch } }] }
          : {}),
      },
      include: memberWithLatestMembership,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const now = new Date();
    return { success: true, data: members.map((m) => toMemberListItem(m, now)) };
  } catch (error) {
    console.error("[getMembers] Error:", error);
    return { success: false, error: "No se pudo cargar el listado de socios" };
  }
}

// -------------------------------------------------------------
// EDICIÓN, BAJA Y ELIMINACIÓN DE SOCIOS
// "Dar de baja" (isActive = false) conserva pagos e ingresos para las métricas y la caja;
// "Eliminar definitivamente" borra el socio con todo su historial (para altas cargadas por error).
// -------------------------------------------------------------

const NO_SESSION_ERROR = "Tu sesión expiró. Volvé a iniciar sesión.";
const memberIdSchema = z.string().trim().min(1).max(64);

export async function getMemberDetail(memberId: string): Promise<ActionResponse<MemberDetail>> {
  try {
    if (!(await hasActionSession())) return { success: false, error: NO_SESSION_ERROR };
    const id = memberIdSchema.safeParse(memberId);
    if (!id.success) return { success: false, error: "Socio inválido" };

    const member = await prisma.member.findUnique({
      where: { id: id.data },
      include: { ...memberWithLatestMembership, _count: { select: { payments: true, checkIns: true } } },
    });
    if (!member) return { success: false, error: "El socio ya no existe" };

    return {
      success: true,
      data: {
        ...toMemberListItem(member, new Date()),
        notes: member.notes,
        createdAt: member.createdAt.toISOString(),
        paymentsCount: member._count.payments,
        checkInsCount: member._count.checkIns,
      },
    };
  } catch (error) {
    console.error("[getMemberDetail] Error:", error);
    return { success: false, error: "No se pudieron cargar los datos del socio" };
  }
}

export async function updateMember(input: UpdateMemberInput): Promise<ActionResponse<MemberListItem>> {
  try {
    if (!(await hasActionSession())) return { success: false, error: NO_SESSION_ERROR };
    const parsed = updateMemberSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Datos del socio inválidos" };
    }
    const { id, fullName, dni, phone, notes, photoBase64 } = parsed.data;

    if (!resolveSafePhotoPath(dni)) return { success: false, error: "Identificador inválido" };

    const current = await prisma.member.findUnique({ where: { id } });
    if (!current) return { success: false, error: "El socio ya no existe" };

    if (dni !== current.dni) {
      const owner = await prisma.member.findUnique({ where: { dni }, select: { fullName: true } });
      if (owner) return { success: false, error: `El DNI ${dni} ya pertenece a ${owner.fullName}` };
    }

    const newPhotoFilename =
      photoBase64 && photoBase64.trim().length > 0 ? await saveMemberPhotoToDisk(dni, photoBase64) : null;

    let updated;
    try {
      updated = await prisma.member.update({
        where: { id },
        data: {
          fullName,
          dni,
          phone: phone || null,
          notes: notes || null,
          ...(newPhotoFilename ? { photoFilename: newPhotoFilename } : {}),
        },
        include: memberWithLatestMembership,
      });
    } catch (error) {
      await deleteMemberPhotoFromDisk(newPhotoFilename);
      if (isUniqueConstraintError(error)) {
        return { success: false, error: `El DNI ${dni} ya pertenece a otro socio` };
      }
      throw error;
    }

    if (newPhotoFilename) await deleteMemberPhotoFromDisk(current.photoFilename);

    revalidatePath("/admin");
    return { success: true, data: toMemberListItem(updated, new Date()) };
  } catch (error) {
    console.error("[updateMember] Error:", error);
    return { success: false, error: "No se pudieron guardar los cambios del socio" };
  }
}

export async function setMemberActive(
  memberId: string,
  isActive: boolean
): Promise<ActionResponse<{ fullName: string }>> {
  try {
    if (!(await hasActionSession())) return { success: false, error: NO_SESSION_ERROR };
    const id = memberIdSchema.safeParse(memberId);
    if (!id.success || typeof isActive !== "boolean") return { success: false, error: "Socio inválido" };

    const member = await prisma.member.update({
      where: { id: id.data },
      data: { isActive },
      select: { fullName: true },
    });
    revalidatePath("/admin");
    return { success: true, data: member };
  } catch (error) {
    console.error("[setMemberActive] Error:", error);
    return { success: false, error: "No se pudo actualizar el estado del socio" };
  }
}

export async function deleteMemberPermanently(
  memberId: string,
  confirmDni: string
): Promise<ActionResponse<{ fullName: string }>> {
  try {
    if (!(await hasActionSession())) return { success: false, error: NO_SESSION_ERROR };
    const id = memberIdSchema.safeParse(memberId);
    if (!id.success) return { success: false, error: "Socio inválido" };

    const member = await prisma.member.findUnique({ where: { id: id.data } });
    if (!member) return { success: false, error: "El socio ya no existe" };
    if (String(confirmDni ?? "").trim() !== member.dni) {
      return { success: false, error: "El DNI escrito no coincide con el del socio" };
    }

    // Membresías, pagos e ingresos se borran en cascada (onDelete: Cascade en el schema).
    await prisma.member.delete({ where: { id: member.id } });
    await deleteMemberPhotoFromDisk(member.photoFilename);

    revalidatePath("/admin");
    return { success: true, data: { fullName: member.fullName } };
  } catch (error) {
    console.error("[deleteMemberPermanently] Error:", error);
    return { success: false, error: "No se pudo eliminar el socio" };
  }
}
