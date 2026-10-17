import fs from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateFallbackAvatarWebp,
  getLocalPhotosDir,
} from "@/lib/photo-storage";

const CACHE_HEADERS = {
  "Content-Type": "image/webp",
  "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
};

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
    let memberInitials = "AF";

    if (!targetFilename) {
      const member = await prisma.member.findUnique({
        where: { dni: cleanDni },
        select: { photoFilename: true, fullName: true },
      });

      if (member?.photoFilename) {
        targetFilename = path.basename(member.photoFilename);
      }
      if (member?.fullName) {
        memberInitials = member.fullName
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0])
          .join("");
      }
    }

    if (targetFilename) {
      const filePath = path.join(/*turbopackIgnore: true*/ getLocalPhotosDir(), targetFilename);
      try {
        const buffer = await fs.readFile(/*turbopackIgnore: true*/ filePath);
        return new NextResponse(new Uint8Array(buffer), {
          status: 200,
          headers: CACHE_HEADERS,
        });
      } catch {
        // Si el archivo físico no existe en LOCAL_PHOTOS_PATH, se sirve avatar WebP de respaldo
      }
    }

    const fallbackBuffer = await generateFallbackAvatarWebp(memberInitials);
    return new NextResponse(new Uint8Array(fallbackBuffer), {
      status: 200,
      headers: CACHE_HEADERS,
    });
  } catch (error) {
    console.error("[GET /api/members/[dni]/photo] Error:", error);
    const fallbackBuffer = await generateFallbackAvatarWebp("AF");
    return new NextResponse(new Uint8Array(fallbackBuffer), {
      status: 200,
      headers: CACHE_HEADERS,
    });
  }
}
