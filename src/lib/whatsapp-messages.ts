// Mensajes prearmados de los avisos por WhatsApp. El operador los puede editar en el modal antes de abrir el chat.
import { formatCurrencyARS, formatDateAR } from "@/lib/utils";

const GYM_NAME = "Gimnasio Ave Fénix";

interface OverdueReminderData {
  fullName: string;
  planName: string;
  /** Valor de la cuota. Sin dato (o 0) no se menciona el monto. */
  planPrice?: number | null;
  validUntil: string | null;
}

/** Recordatorio de cuota vencida: nombre, plan, valor de la cuota y fecha de vencimiento. */
export function overdueReminderMessage({ fullName, planName, planPrice, validUntil }: OverdueReminderData): string {
  const price = planPrice ? ` (${formatCurrencyARS(planPrice)})` : "";
  const detail = validUntil
    ? `tu cuota del plan ${planName}${price} venció el ${formatDateAR(validUntil)}`
    : `tenés pendiente el pago de tu cuota del plan ${planName}${price}`;
  return `¡Hola ${fullName}! Te escribimos de ${GYM_NAME} para recordarte que ${detail}. ¡Te esperamos en recepción para renovarla!`;
}

/** Recontacto de un socio que dejó de venir. */
export function absentMemberMessage(fullName: string, daysAbsent: number): string {
  return `¡Hola ${fullName}! Te escribimos de ${GYM_NAME}. Hace ${daysAbsent} días que no te vemos entrenar y queríamos saber cómo estás. ¡Te esperamos esta semana para retomar con toda la energía!`;
}

export function genericGreetingMessage(fullName: string): string {
  return `¡Hola ${fullName}! Te escribimos de ${GYM_NAME}.`;
}
