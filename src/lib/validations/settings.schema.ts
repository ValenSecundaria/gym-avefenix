import { z } from "zod";

/**
 * Limpia caracteres no numéricos y asegura el prefijo internacional de WhatsApp para Argentina (549...).
 */
export function formatGymPhone(rawPhone: string): string {
  let digits = rawPhone.replace(/\D/g, "");
  // Quitar ceros a la izquierda comunes en marcación local (ej. 0291...)
  digits = digits.replace(/^0+/, "");
  if (!digits) return "";

  if (digits.startsWith("549")) {
    return digits;
  }
  if (digits.startsWith("54")) {
    return `549${digits.slice(2)}`;
  }
  return `549${digits}`;
}

/**
 * Esquema Zod para validar y sanitizar el teléfono del gimnasio.
 * Exige una longitud final entre 10 y 15 dígitos numéricos.
 */
export const gymPhoneSchema = z
  .string()
  .trim()
  .min(1, "El número de WhatsApp no puede estar vacío")
  .transform((val) => formatGymPhone(val))
  .refine((val) => /^\d{10,15}$/.test(val), {
    message: "El número de WhatsApp debe contener entre 10 y 15 dígitos numéricos válidos",
  });

export const updateGymPhoneSchema = z.object({
  userId: z.string().optional(),
  gymPhone: gymPhoneSchema,
});

export type UpdateGymPhoneInput = z.infer<typeof updateGymPhoneSchema>;
