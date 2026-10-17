// Tipos compartidos del flujo de autenticación con sesión persistente (online/offline).

export interface AuthenticatedUser {
  id: string;
  username: string;
  name: string;
}

/** Payload firmado (HMAC) que viaja en la cookie de sesión. */
export interface SessionTokenPayload extends AuthenticatedUser {
  iat: number;
}

/** Resultado de un login/reanudación exitosa contra el servidor. */
export interface AuthSessionResult {
  user: AuthenticatedUser;
  sessionToken: string;
  issuedAt: number;
}

export type SessionMode = "online" | "offline";

/** Sesión del lado cliente, replicada en sessionStorage + IndexedDB (gym_auth_store). */
export interface ClientSession {
  user: AuthenticatedUser;
  /** Último token firmado por el servidor (null si no se dispone de uno). */
  token: string | null;
  mode: SessionMode;
  authenticatedAt: number;
}

export type AuthStatus = "LOADING" | "AUTHENTICATED" | "UNAUTHENTICATED";

export type LoginOutcome =
  | { ok: true; session: ClientSession }
  | { ok: false; error: string };
