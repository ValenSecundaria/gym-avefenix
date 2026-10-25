// Constantes del flujo de autenticación (compartidas por servidor, proxy y cliente).

/** Cookie httpOnly firmada con la sesión. Sin Max-Age: muere al cerrarse el proceso del navegador / apagar el equipo. */
export const SESSION_COOKIE_NAME = "avefenix_session";

/** Cookie testigo (legible por JS, también de sesión) que indica que el navegador sigue vivo desde el login. */
export const SESSION_ALIVE_COOKIE = "avefenix_alive";

/** Clave de la sesión activa en sessionStorage. */
export const SESSION_STORAGE_KEY = "gym_auth_session";

/** Base IndexedDB donde se replica la sesión y la caché segura de credenciales offline. */
export const AUTH_DB_NAME = "gym_auth_store";

/** Antigüedad máxima de un token firmado para reanudar online una sesión iniciada offline. */
export const OFFLINE_RESUME_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/** Rutas que exigen sesión activa (se validan en proxy.ts y en el SessionGuard del cliente). */
export const PROTECTED_ROUTE_PREFIXES = ["/admin", "/launch"] as const;

/** Código de error devuelto cuando el servidor/base de datos no está disponible (habilita el login offline). */
export const AUTH_UNAVAILABLE_CODE = "SERVICE_UNAVAILABLE";
