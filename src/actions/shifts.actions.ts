"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { formatShift } from "@/lib/shifts/shift-formatter";
import { autoCloseExpiredShifts } from "@/lib/shifts/auto-close-shifts";
import type { ActionResponse, TeacherShiftItem, ToggleShiftResult } from "@/types";

const identifierSchema = z.object({
  userId: z.string().trim().min(1).optional(),
  dni: z.string().trim().min(6).max(12).optional(),
  // Lo que el panel muestra como próximo paso. Si el turno ya cambió (otra pestaña, el teclado del
  // molinete o un doble clic), no se invierte: se devuelve el estado real.
  expect: z.enum(["CHECK_IN", "CHECK_OUT"]).optional(),
});

/**
 * En el teclado del molinete, un DNI repetido enseguida de la entrada no cierra el turno:
 * evita que un doble tipeo marque la salida sin querer. Pasado este tiempo, el DNI marca la salida.
 */
const MIN_MINUTES_BEFORE_KEYPAD_CHECKOUT = 3;

const shiftInclude = { user: { select: { name: true, dni: true } } } as const;

export async function toggleTeacherShiftAction(
  identifier: { userId?: string; dni?: string; expect?: "CHECK_IN" | "CHECK_OUT" }
): Promise<ActionResponse<ToggleShiftResult>> {
  try {
    await autoCloseExpiredShifts();
    const parsed = identifierSchema.safeParse(identifier);
    if (!parsed.success || (!parsed.data.userId && !parsed.data.dni)) {
      return { success: false, error: "Identificador de profesor inválido" };
    }
    const { userId, dni, expect } = parsed.data;

    const user = await prisma.user.findFirst({
      where: userId ? { id: userId } : { dni: dni! },
      select: { id: true, name: true, role: true, dni: true },
    });

    if (!user || user.role !== "PROFESOR") {
      return { success: false, error: "No se encontró ningún profesor registrado con ese identificador" };
    }

    const result = await prisma.$transaction(async (tx): Promise<ToggleShiftResult> => {
      // Un solo cambio de turno a la vez por profesor: dos pedidos simultáneos no abren dos turnos.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${user.id}))`;

      const openShift = await tx.teacherShift.findFirst({
        where: { userId: user.id, checkOut: null },
        orderBy: { checkIn: "desc" },
        include: shiftInclude,
      });

      const now = new Date();

      if (!openShift) {
        if (expect === "CHECK_OUT") {
          // El panel creía que estaba en turno, pero ya se cerró: no se abre uno nuevo por error.
          const last = await tx.teacherShift.findFirst({
            where: { userId: user.id },
            orderBy: { checkIn: "desc" },
            include: shiftInclude,
          });
          if (last) {
            return { action: "CHECK_OUT", shift: formatShift(last), totalMinutes: last.totalMinutes, teacherName: user.name };
          }
        }
        const newShift = await tx.teacherShift.create({
          data: { userId: user.id, checkIn: now, checkOut: null },
          include: shiftInclude,
        });
        return { action: "CHECK_IN", shift: formatShift(newShift), teacherName: user.name };
      }

      const minutesOpen = (now.getTime() - openShift.checkIn.getTime()) / 60000;
      const keypadTooSoon = !userId && minutesOpen < MIN_MINUTES_BEFORE_KEYPAD_CHECKOUT;
      if (expect === "CHECK_IN" || keypadTooSoon) {
        return { action: "ALREADY_ACTIVE", shift: formatShift(openShift), teacherName: user.name };
      }

      const totalMinutes = Math.round(Math.max(0, now.getTime() - openShift.checkIn.getTime()) / 60000);
      const updated = await tx.teacherShift.update({
        where: { id: openShift.id },
        data: { checkOut: now, totalMinutes },
        include: shiftInclude,
      });
      return { action: "CHECK_OUT", shift: formatShift(updated), totalMinutes, teacherName: user.name };
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("[toggleTeacherShiftAction] Error:", error);
    return { success: false, error: "No se pudo registrar la asistencia del profesor" };
  }
}

export async function getActiveTeacherShiftAction(userId: string): Promise<ActionResponse<TeacherShiftItem | null>> {
  try {
    await autoCloseExpiredShifts();
    const shift = await prisma.teacherShift.findFirst({
      where: { userId, checkOut: null },
      orderBy: { checkIn: "desc" },
      include: shiftInclude,
    });
    return { success: true, data: shift ? formatShift(shift) : null };
  } catch (error) {
    console.error("[getActiveTeacherShiftAction] Error:", error);
    return { success: false, error: "No se pudo verificar el turno activo" };
  }
}
