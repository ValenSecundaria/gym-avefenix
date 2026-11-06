import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_HOME, PROFESOR_HOME, SESSION_COOKIE_NAME, homePathFor } from "@/lib/auth/auth-constants";
import { verifySessionToken } from "@/lib/auth/session-token";

// Chequeo optimista de sesión: sin cookie firmada válida, las rutas operativas redirigen a /login.
// Cada rol tiene su panel: el profesor no entra a /admin y la administración no usa /profesor.
// (Offline, el Service Worker sirve las páginas cacheadas y el SessionGuard del cliente hace la validación.)
export async function proxy(request: NextRequest) {
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (!session) return NextResponse.redirect(new URL("/login", request.url));

  const home = homePathFor(session);
  const path = request.nextUrl.pathname;
  const inAdmin = path === ADMIN_HOME || path.startsWith(`${ADMIN_HOME}/`) || path === "/launch";
  const inProfesor = path === PROFESOR_HOME || path.startsWith(`${PROFESOR_HOME}/`);
  if ((inAdmin && home !== ADMIN_HOME) || (inProfesor && home !== PROFESOR_HOME)) {
    return NextResponse.redirect(new URL(home, request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Debe coincidir con PROTECTED_ROUTE_PREFIXES (el matcher exige valores estáticos).
  matcher: ["/admin", "/admin/:path*", "/launch", "/profesor", "/profesor/:path*"],
};
