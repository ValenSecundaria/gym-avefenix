import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, "El nombre de usuario debe tener al menos 2 caracteres")
    .max(50, "Nombre de usuario demasiado largo"),
  password: z
    .string()
    .min(4, "La contraseña debe tener al menos 4 caracteres")
    .max(100, "Contraseña demasiado larga"),
});

export type LoginInput = z.infer<typeof loginSchema>;
