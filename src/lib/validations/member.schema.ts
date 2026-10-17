import { z } from "zod";

export const createMemberSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "El nombre completo debe tener al menos 3 caracteres")
    .max(100, "El nombre completo no puede superar los 100 caracteres"),
  dni: z
    .string()
    .trim()
    .regex(
      /^\d{6,10}$/,
      "El DNI debe contener entre 6 y 10 dígitos numéricos (incluye DNI extranjero de 6 dígitos)"
    ),
  phone: z
    .string()
    .trim()
    .max(30, "Teléfono demasiado largo")
    .optional()
    .or(z.literal("")),
  planId: z
    .string()
    .trim()
    .min(1, "Debe seleccionar un plan válido"),
  paymentMethod: z.enum(["EFECTIVO", "TRANSFERENCIA"]),
  photoBase64: z.string().optional().nullable(),
  notes: z
    .string()
    .trim()
    .max(500, "Las notas no pueden superar los 500 caracteres")
    .optional()
    .or(z.literal("")),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
