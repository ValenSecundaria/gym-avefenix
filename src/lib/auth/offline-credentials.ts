// Caché segura de credenciales para ingreso offline (sólo cliente).
// Nunca se guarda la contraseña ni el hash bcrypt del servidor: se deriva un verificador local
// con PBKDF2-SHA256 + sal aleatoria por usuario, que sólo sirve para comprobar la contraseña en este equipo.
import type { AuthenticatedUser } from "@/types/auth";
import { idbGet, idbPut } from "./idb-store";

const PBKDF2_ITERATIONS = 210_000;
const encoder = new TextEncoder();

export interface OfflineCredentialRecord {
  username: string;
  salt: string;
  verifier: string;
  iterations: number;
  user: AuthenticatedUser;
  /** Último token firmado por el servidor para este usuario (permite reanudar online tras un ingreso offline). */
  lastToken: string;
  updatedAt: number;
}

function canUseCrypto(): boolean {
  return typeof crypto !== "undefined" && typeof crypto.subtle !== "undefined";
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function credentialKey(username: string): string {
  // Igual que la búsqueda del servidor (prisma findUnique): sensible a mayúsculas.
  return username.trim();
}

async function deriveVerifier(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<string> {
  const baseKey = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, baseKey, 256);
  return toBase64(new Uint8Array(bits));
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Guarda (o renueva) el verificador offline tras un login online exitoso. */
export async function cacheOfflineCredentials(
  username: string,
  password: string,
  user: AuthenticatedUser,
  token: string
): Promise<void> {
  if (!canUseCrypto()) return;
  const salt = crypto.getRandomValues(new Uint8Array(new ArrayBuffer(16)));
  const record: OfflineCredentialRecord = {
    username: credentialKey(username),
    salt: toBase64(salt),
    verifier: await deriveVerifier(password, salt, PBKDF2_ITERATIONS),
    iterations: PBKDF2_ITERATIONS,
    user,
    lastToken: token,
    updatedAt: Date.now(),
  };
  await idbPut("credentials", record.username, record);
}

export type OfflineVerification =
  | { status: "VALID"; record: OfflineCredentialRecord }
  | { status: "INVALID_PASSWORD" }
  | { status: "NOT_CACHED" };

/** Valida la contraseña contra la caché local (sin red). */
export async function verifyOfflineCredentials(username: string, password: string): Promise<OfflineVerification> {
  if (!canUseCrypto()) return { status: "NOT_CACHED" };
  const record = await idbGet<OfflineCredentialRecord>("credentials", credentialKey(username));
  if (!record) return { status: "NOT_CACHED" };
  const candidate = await deriveVerifier(password, fromBase64(record.salt), record.iterations);
  return constantTimeEqual(candidate, record.verifier) ? { status: "VALID", record } : { status: "INVALID_PASSWORD" };
}
