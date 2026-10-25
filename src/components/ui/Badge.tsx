import React from "react";
import { cn } from "@/lib/utils";
import type { AccessStatusType, MembershipStatusType } from "@/types";

export type BadgeVariant =
  | AccessStatusType
  | MembershipStatusType
  | "SIN_MEMBRESIA"
  | "primary"
  | "neutral"
  | "success"
  | "danger"
  | "warning";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  status?: AccessStatusType | MembershipStatusType | "SIN_MEMBRESIA";
  showDot?: boolean;
}

const BADGE_STYLES: Record<BadgeVariant, { container: string; dot: string; label?: string }> = {
  HABILITADO: {
    container: "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40",
    dot: "bg-[#10B981]",
    label: "Habilitado",
  },
  ACTIVA: {
    container: "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40",
    dot: "bg-[#10B981]",
    label: "Activa",
  },
  success: {
    container: "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40",
    dot: "bg-[#10B981]",
  },
  CUOTA_VENCIDA: {
    container: "bg-[#D92614]/15 text-[#D92614] border-[#D92614]/40",
    dot: "bg-[#D92614]",
    label: "Cuota Vencida",
  },
  VENCIDA: {
    container: "bg-[#D92614]/15 text-[#D92614] border-[#D92614]/40",
    dot: "bg-[#D92614]",
    label: "Vencida",
  },
  danger: {
    container: "bg-[#D92614]/15 text-[#D92614] border-[#D92614]/40",
    dot: "bg-[#D92614]",
  },
  LIMITE_ALCANZADO: {
    container: "bg-[#FFB300]/15 text-[#FFB300] border-[#FFB300]/40",
    dot: "bg-[#FFB300]",
    label: "Límite Alcanzado",
  },
  warning: {
    container: "bg-[#FFB300]/15 text-[#FFB300] border-[#FFB300]/40",
    dot: "bg-[#FFB300]",
  },
  primary: {
    container: "bg-[#F95716]/15 text-[#F95716] border-[#F95716]/40",
    dot: "bg-[#F95716]",
  },
  CANCELADA: {
    container: "bg-[#23232A] text-[#8A909A] border-[#2C2D35]",
    dot: "bg-[#8A909A]",
    label: "Cancelada",
  },
  SIN_MEMBRESIA: {
    container: "bg-[#23232A] text-[#8A909A] border-[#2C2D35]",
    dot: "bg-[#8A909A]",
    label: "Sin Membresía",
  },
  neutral: {
    container: "bg-[#23232A] text-[#8A909A] border-[#2C2D35]",
    dot: "bg-[#8A909A]",
  },
};

export function Badge({
  variant = "neutral",
  status,
  showDot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  const key: BadgeVariant = status ?? variant;
  const style = BADGE_STYLES[key] ?? BADGE_STYLES.neutral;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border",
        style.container,
        className
      )}
      {...props}
    >
      {showDot && (
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", style.dot)} aria-hidden="true" />
      )}
      {children ?? style.label ?? key}
    </span>
  );
}
