import { NextResponse } from "next/server";
import { autoCloseExpiredShifts } from "@/lib/shifts/auto-close-shifts";

export async function GET() {
  const closedCount = await autoCloseExpiredShifts();
  return NextResponse.json({ success: true, closedCount, timestamp: new Date().toISOString() });
}

export async function POST() {
  const closedCount = await autoCloseExpiredShifts();
  return NextResponse.json({ success: true, closedCount, timestamp: new Date().toISOString() });
}
