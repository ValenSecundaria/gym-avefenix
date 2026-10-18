import fs from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLocalPhotosDir } from "@/lib/photo-storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dni: string }> }
) {
  // Consumir una propiedad dinámica de la request marca la ruta como dinámica
  // para el nuevo compilador sin necesidad de 'export const dynamic'
  request.headers.get("accept");

  try {
    const { dni } = await params;

    const member = await prisma.member.findUnique({
      where: { dni },
      select: { photoFilename: true },
    });

    if (!member || !member.photoFilename) {
      return NextResponse.json({ error: "Foto no encontrada" }, { status: 404 });
    }

    const photosDir = getLocalPhotosDir();
    const filePath = path.join(photosDir, member.photoFilename);

    const fileBuffer = await fs.readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
      },
    });
  } catch (error) {
    console.error("Error al servir la foto:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}