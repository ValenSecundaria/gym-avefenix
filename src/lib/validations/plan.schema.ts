import { z } from "zod";

export const disciplineSchema = z.object({
  id: z.string().trim().max(64).optional(),
  name: z
    .string()
    .trim()
    .min(2, "El nombre de la disciplina debe tener al menos 2 caracteres")
    .max(40, "El nombre de la disciplina no puede superar los 40 caracteres"),
});

export type DisciplineInput = z.infer<typeof disciplineSchema>;

export const planSchema = z
  .object({
    id: z.string().trim().max(64).optional(),
    name: z
      .string()
      .trim()
      .min(3, "El nombre del plan debe tener al menos 3 caracteres")
      .max(60, "El nombre del plan no puede superar los 60 caracteres"),
    disciplineId: z.string().trim().min(1, "Elegí la disciplina del plan").max(64),
    category: z.enum(["MENSUAL_LIBRE", "MENSUAL_DIAS", "DIARIO"]),
    allowedDaysPerWeek: z.number().int().min(1).max(6).nullable(),
    price: z.number().positive("El precio debe ser mayor a cero").max(10_000_000, "Precio demasiado alto"),
  })
  .refine((p) => p.category !== "MENSUAL_DIAS" || p.allowedDaysPerWeek !== null, {
    message: "Indicá cuántos días por semana incluye el plan",
    path: ["allowedDaysPerWeek"],
  });

export type PlanInput = z.infer<typeof planSchema>;

// Duración y días por semana se deducen del tipo de plan: así el molinete los interpreta siempre igual.
export function planRulesFor(category: PlanInput["category"], allowedDaysPerWeek: number | null) {
  if (category === "DIARIO") return { durationDays: 1, allowedDaysPerWeek: 1 };
  if (category === "MENSUAL_DIAS") return { durationDays: 30, allowedDaysPerWeek };
  return { durationDays: 30, allowedDaysPerWeek: null };
}
