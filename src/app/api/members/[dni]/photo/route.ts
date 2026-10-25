import fs from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveSafePhotoPath } from "@/lib/security/safe-path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dni: string }> }
) {
  // Consumir una propiedad dinámica de la request marca la ruta como dinámica
  // para el nuevo compilador sin necesidad de 'export const dynamic'
  request.headers.get("accept");

  try {
    const { dni } = await params;

    if (!resolveSafePhotoPath(dni)) {
      return NextResponse.json({ error: "Identificador inválido" }, { status: 400 });
    }

    const member = await prisma.member.findUnique({
      where: { dni },
      select: { photoFilename: true },
    });

    if (!member || !member.photoFilename) {
      return NextResponse.json({ error: "Foto no encontrada" }, { status: 404 });
    }

    const safeFilePath = resolveSafePhotoPath(member.photoFilename);
    if (!safeFilePath) {
      return NextResponse.json({ error: "Identificador inválido" }, { status: 400 });
    }

    try {
      const fileBuffer = await fs.readFile(/*turbopackIgnore: true*/ safeFilePath);
      const ext = path.extname(member.photoFilename).toLowerCase();
      const contentType =
        ext === ".webp" ? "image/webp" : ext === ".png" ? "image/png" : "image/jpeg";

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": contentType,
        },
      });
    } catch (readError: unknown) {
      if ((readError as { code?: string })?.code === "ENOENT") {
        return NextResponse.json({ error: "Foto no encontrada" }, { status: 404 });
      }
      throw readError;
    }
  } catch (error) {
    console.error("Error al servir la foto:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}