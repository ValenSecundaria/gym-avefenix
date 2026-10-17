import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { verifySessionToken } from "@/lib/auth/session-token";

// Chequeo optimista de sesión: sin cookie firmada válida, las rutas operativas redirigen a /login.
// (Offline, el Service Worker sirve las páginas cacheadas y el SessionGuard del cliente hace la validación.)
export async function proxy(request: NextRequest) {
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (session) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Debe coincidir con PROTECTED_ROUTE_PREFIXES (el matcher exige valores estáticos).
  matcher: ["/admin/:path*", "/launch"],
};
