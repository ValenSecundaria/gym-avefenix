import { getSessionCookie } from "@/lib/auth/session-cookie";
import { verifySessionToken } from "@/lib/auth/session-token";

/**
 * Verifica la sesión dentro de una Server Action. Las acciones se pueden invocar por POST
 * sin pasar por proxy.ts, así que las que modifican o borran datos deben chequearla ellas mismas.
 */
export async function hasActionSession(): Promise<boolean> {
  const session = await verifySessionToken(await getSessionCookie());
  return Boolean(session);
}
