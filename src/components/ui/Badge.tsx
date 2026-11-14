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
    container: "bg-brand-alert/15 text-brand-alertText border-brand-alert/40",
    dot: "bg-brand-alert",
    label: "Cuota Vencida",
  },
  VENCIDA: {
    container: "bg-brand-alert/15 text-brand-alertText border-brand-alert/40",
    dot: "bg-brand-alert",
    label: "Vencida",
  },
  danger: {
    container: "bg-brand-alert/15 text-brand-alertText border-brand-alert/40",
    dot: "bg-brand-alert",
  },
  LIMITE_ALCANZADO: {
    container: "bg-brand-warning/15 text-brand-warning border-brand-warning/40",
    dot: "bg-brand-warning",
    label: "Límite Alcanzado",
  },
  warning: {
    container: "bg-brand-warning/15 text-brand-warning border-brand-warning/40",
    dot: "bg-brand-warning",
  },
  primary: {
    container: "bg-brand-primary/15 text-brand-primaryText border-brand-primary/40",
    dot: "bg-brand-primary",
  },
  CANCELADA: {
    container: "bg-brand-surfaceHover text-brand-textSecondary border-brand-border",
    dot: "bg-brand-textSecondary",
    label: "Cancelada",
  },
  SIN_MEMBRESIA: {
    container: "bg-brand-surfaceHover text-brand-textSecondary border-brand-border",
    dot: "bg-brand-textSecondary",
    label: "Sin Membresía",
  },
  neutral: {
    container: "bg-brand-surfaceHover text-brand-textSecondary border-brand-border",
    dot: "bg-brand-textSecondary",
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
