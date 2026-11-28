"use client";

import React from "react";
import { useLocalMemberPhoto } from "@/lib/offline/use-local-photos";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  memberId?: string | null;
  /** URL del servidor (/api/members/DNI/photo?v=...) o la imagen por defecto. */
  src: string;
};

/**
 * <img> de la foto de un socio. Si en este dispositivo hay una foto más nueva que todavía no se subió
 * (o se acaba de subir), muestra esa: funciona sin internet y no depende de la URL del servidor.
 * Mismo aspecto que un <img> común (recibe las mismas clases).
 */
export function MemberPhotoImg({ memberId, src, alt = "", ...rest }: Props) {
  const local = useLocalMemberPhoto(memberId, src);
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...rest} src={local?.url ?? src} alt={alt} />;
}
