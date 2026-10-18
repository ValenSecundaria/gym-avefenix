import fs from "fs/promises";
import path from "path";
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLocalPhotosDir } from "@/lib/photo-storage";

const CACHE_HEADERS = {
  "Content-Type": "image/jpeg",
  "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
};

const LOGO_PATH = path.join(process.cwd(), "public", "Logo.jpeg");

async function getFallbackLogo(): Promise<Buffer> {
  return fs.readFile(LOGO_PATH);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ dni: string }> }
): Promise<NextResponse> {
  try {
    const { dni } = await context.params;
    const cleanDni = decodeURIComponent(dni).trim();
    const versionFilename = request.nextUrl.searchParams.get("v");

    let targetFilename: string | null = versionFilename
      ? path.basename(versionFilename)
      : null;

    if (!targetFilename) {
      const member = await prisma.member.findUnique({
        where: { dni: cleanDni },
        select: { photoFilename: true, fullName: true },
      });

      if (member?.photoFilename) {
        targetFilename = path.basename(member.photoFilename);
      }
    }

    if (targetFilename) {
      const filePath = path.join(
        /*turbopackIgnore: true*/ getLocalPhotosDir(),
        targetFilename
      );

      try {
        const buffer = await fs.readFile(
          /*turbopackIgnore: true*/ filePath
        );

        return new NextResponse(new Uint8Array(buffer), {
          status: 200,
          headers: CACHE_HEADERS,
        });
      } catch {
        // Si la foto no existe o no se puede leer,
        // se utiliza el logo del sistema.
      }
    }
  } catch (error) {
    console.error(
      "[GET /api/members/[dni]/photo] Error:",
      error
    );
  }

  try {
    const fallbackBuffer = await getFallbackLogo();

    return new NextResponse(new Uint8Array(fallbackBuffer), {
      status: 200,
      headers: CACHE_HEADERS,
    });
  } catch (error) {
    console.error(
      "[GET /api/members/[dni]/photo] Error al leer el logo:",
      error
    );

    return new NextResponse(null, { status: 500 });
  }
}
