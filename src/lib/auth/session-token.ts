// Firma/verificación HMAC-SHA256 del token de sesión con Web Crypto.
// Compatible con Server Actions y con proxy.ts (sin dependencias de Node).
import type { AuthenticatedUser, SessionTokenPayload } from "@/types/auth";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getSecret(): string | null {
  // AUTH_SECRET es el recomendado; DATABASE_URL (secreto sólo del servidor) actúa de respaldo para no romper despliegues existentes.
  return process.env.AUTH_SECRET || process.env.DATABASE_URL || null;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

function isPayload(value: unknown): value is SessionTokenPayload {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.username === "string" &&
    typeof v.name === "string" &&
    typeof v.iat === "number"
  );
}

export async function signSessionToken(user: AuthenticatedUser, issuedAt = Date.now()): Promise<string> {
  const secret = getSecret();
  if (!secret) throw new Error("AUTH_SECRET no configurado");
  const payload: SessionTokenPayload = { id: user.id, username: user.username, name: user.name, iat: issuedAt };
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", await importKey(secret), encoder.encode(body));
  return `${body}.${toBase64Url(new Uint8Array(signature))}`;
}

/** Devuelve el payload si la firma es válida (y no supera maxAgeMs, si se indica); null en cualquier otro caso. */
export async function verifySessionToken(
  token: string | undefined | null,
  maxAgeMs?: number
): Promise<SessionTokenPayload | null> {
  const secret = getSecret();
  if (!secret || !token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      await importKey(secret),
      fromBase64Url(signature),
      encoder.encode(body)
    );
    if (!valid) return null;
    const payload: unknown = JSON.parse(decoder.decode(fromBase64Url(body)));
    if (!isPayload(payload)) return null;
    if (maxAgeMs !== undefined && Date.now() - payload.iat > maxAgeMs) return null;
    return payload;
  } catch {
    return null;
  }
}
