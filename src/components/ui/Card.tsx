import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  highlighted?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const PADDING_CLASSES: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  hoverable = false,
  highlighted = false,
  padding = "md",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-brand-surface border border-brand-border text-brand-textPrimary shadow-lg transition-all duration-200",
        hoverable && "hover:bg-brand-surfaceHover hover:border-brand-textSecondary/40",
        highlighted &&
          "border-brand-primary shadow-[0_0_32px_-6px_rgba(37,99,235,0.3)]",
        PADDING_CLASSES[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-1.5 mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg sm:text-xl font-bold text-brand-textPrimary tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-brand-textSecondary", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("w-full", className)} {...props}>
      {children}
    </div>
  );
}
