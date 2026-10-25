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
  amount: z.coerce
    .number()
    .positive("El monto a cobrar debe ser mayor a cero"),
  method: z.enum(["EFECTIVO", "TRANSFERENCIA"]),
  notes: z
    .string()
    .trim()
    .max(300, "Las notas no pueden superar los 300 caracteres")
    .optional()
    .or(z.literal("")),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
