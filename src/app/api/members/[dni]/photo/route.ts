import fs from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveSafePhotoPath } from "@/lib/security/safe-path";

// El nombre de archivo cambia con cada foto nueva (member-DNI-timestamp.webp), así que una URL
// con ?v= siempre devuelve la misma imagen y el navegador la puede guardar sin volver a pedirla.
const VERSIONED_CACHE = "private, max-age=31536000, immutable";

function contentTypeFor(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return ext === ".webp" ? "image/webp" : ext === ".png" ? "image/png" : "image/jpeg";
}

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

    // Camino rápido: la URL ya trae el archivo (?v=member-DNI-...). Se lee directo del disco de la
    // notebook sin consultar la base, así las fotos se ven aunque no haya internet.
    const requested = request.nextUrl.searchParams.get("v");
    let photoFilename: string | null = null;
    let versioned = false;
    if (requested && requested.startsWith(`member-${dni}-`) && resolveSafePhotoPath(requested)) {
      photoFilename = requested;
      versioned = true;
    } else {
      const member = await prisma.member.findUnique({
        where: { dni },
        select: { photoFilename: true },
      });
      photoFilename = member?.photoFilename ?? null;
    }

    if (!photoFilename) {
      return NextResponse.json({ error: "Foto no encontrada" }, { status: 404 });
    }

    const safeFilePath = resolveSafePhotoPath(photoFilename);
    if (!safeFilePath) {
      return NextResponse.json({ error: "Identificador inválido" }, { status: 400 });
    }

    try {
      const fileBuffer = await fs.readFile(/*turbopackIgnore: true*/ safeFilePath);
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": contentTypeFor(photoFilename),
          "Cache-Control": versioned ? VERSIONED_CACHE : "private, no-cache",
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
