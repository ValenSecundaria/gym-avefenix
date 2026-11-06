import { z } from "zod";

export const accessStatusSchema = z.enum([
  "HABILITADO",
  "CUOTA_VENCIDA",
  "LIMITE_ALCANZADO",
]);

export const batchCheckInItemSchema = z.object({
  memberId: z.string().min(1, "El ID de socio es requerido"),
  status: accessStatusSchema,
  createdAt: z.string().datetime().or(z.string().min(1, "Fecha requerida")),
});

export const batchCheckInSchema = z.array(batchCheckInItemSchema);

export type BatchCheckInItem = z.infer<typeof batchCheckInItemSchema>;
export type BatchCheckInInput = z.infer<typeof batchCheckInSchema>;
