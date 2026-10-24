import { z } from "zod";

// Nombre: letras (con acentos y ñ), espacios, apóstrofes y guiones. Teléfono: solo dígitos, hasta 24.
const NAME_REGEX = /^\p{L}[\p{L}\s'’-]*$/u;
const PHONE_MAX_DIGITS = 24;

/** Para el input del nombre: descarta números y símbolos mientras se tipea. */
export function sanitizeNameInput(value: string): string {
  return value.replace(/[^\p{L}\s'’-]/gu, "").replace(/\s{2,}/g, " ");
}

/** Para el input del teléfono: solo dígitos (sin espacios ni guiones), hasta 24. */
export function sanitizePhoneInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, PHONE_MAX_DIGITS);
}

export const createMemberSchema = z.object({
  fullName: z
    .string()
    .trim()
    .transform((v) => v.replace(/\s+/g, " "))
    .pipe(
      z
        .string()
        .min(3, "El nombre completo debe tener al menos 3 caracteres")
        .max(100, "El nombre completo no puede superar los 100 caracteres")
        .regex(NAME_REGEX, "El nombre solo puede tener letras, espacios, apóstrofes o guiones")
    ),
  dni: z
    .string()
    .trim()
    .regex(
      /^\d{6,10}$/,
      "El DNI debe contener entre 6 y 10 dígitos numéricos (incluye DNI extranjero de 6 dígitos)"
    ),
  // Se toleran separadores de altas viejas o cargadas sin internet (espacios, guiones, puntos, paréntesis):
  // se quitan y se guarda solo el número. Letras u otros símbolos se rechazan.
  phone: z
    .string()
    .transform((v) => v.replace(/[\s.()-]/g, ""))
    .pipe(
      z
        .string()
        .regex(/^\d*$/, "El teléfono solo puede tener números")
        .max(PHONE_MAX_DIGITS, `El teléfono no puede superar los ${PHONE_MAX_DIGITS} dígitos`)
    )
    .optional(),
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

// Edición de datos personales. La foto es opcional: null/ausente = se conserva la actual.
export const updateMemberSchema = createMemberSchema
  .pick({ fullName: true, dni: true, phone: true, notes: true, photoBase64: true })
  .extend({ id: z.string().trim().min(1, "Socio inválido").max(64) });

export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
