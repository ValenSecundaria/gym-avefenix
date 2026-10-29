import { NextResponse } from "next/server";
import { getAttendanceAnalytics } from "@/actions/analytics.actions";
import { hasActionSession } from "@/lib/auth/require-session";

// Las métricas se piden por acá (GET) y no como Server Action: las acciones se ejecutan
// de a una en fila en el navegador, y si otra quedaba trabada las métricas no cargaban nunca.
export async function GET(req: Request) {
  if (!(await hasActionSession())) {
    return NextResponse.json({ success: false, error: "Sesión vencida: volvé a iniciar sesión" }, { status: 401 });
  }
  const period = Number(new URL(req.url).searchParams.get("period")) || 90;
  const res = await getAttendanceAnalytics(period);
  return NextResponse.json(res, { status: res.success ? 200 : 500, headers: { "Cache-Control": "no-store" } });
}
