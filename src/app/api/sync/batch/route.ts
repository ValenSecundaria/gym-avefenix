import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { insertCheckInBatch } from "@/lib/checkin-batch";
import { batchCheckInSchema } from "@/lib/validations/sync.schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = batchCheckInSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Payload inválido" }, { status: 400 });
    }

    if (parsed.data.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    const count = await insertCheckInBatch(parsed.data);

    revalidatePath("/admin");
    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error("[api/sync/batch] Error:", error);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
