import { z } from "zod";

export const checkInDniSchema = z.object({
  dni: z
    .string()
    .trim()
    .regex(
      /^\d{6,10}$/,
      "Ingrese un DNI válido de 6 a 10 dígitos numéricos"
    ),
});

export type CheckInDniInput = z.infer<typeof checkInDniSchema>;
