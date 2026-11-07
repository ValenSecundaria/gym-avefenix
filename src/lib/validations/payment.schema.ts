import { z } from "zod";

export const createPaymentSchema = z.object({
  memberId: z
    .string()
    .trim()
    .min(1, "El identificador del socio es obligatorio"),
  planId: z
    .string()
    .trim()
    .min(1, "Debe seleccionar un plan para renovar"),
  // Opcional: sin monto (cuenta de profesor) se cobra el precio del plan.
  amount: z.coerce
    .number()
    .positive("El monto a cobrar debe ser mayor a cero")
    .optional(),
  method: z.enum(["EFECTIVO", "TRANSFERENCIA"]),
  notes: z
    .string()
    .trim()
    .max(300, "Las notas no pueden superar los 300 caracteres")
    .optional()
    .or(z.literal("")),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

// Renovación rápida: sin plan elegido se mantiene el plan actual del socio.
export const quickRenewalSchema = z.object({
  memberId: z.string().trim().min(1, "El identificador del socio es obligatorio"),
  planId: z.string().trim().min(1).optional(),
  amount: z.coerce.number().positive("El monto a cobrar debe ser mayor a cero").optional(),
  method: z.enum(["EFECTIVO", "TRANSFERENCIA"]),
});

export type QuickRenewalInput = z.infer<typeof quickRenewalSchema>;
