import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "surface" | "danger" | "whatsapp" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-primary text-brand-textPrimary hover:bg-brand-primaryHover hover:text-brand-bg border border-transparent shadow-[0_0_20px_-4px_rgba(37,99,235,0.45)]",
  surface:
    "bg-brand-surface text-brand-textPrimary border border-brand-border hover:bg-brand-surfaceHover hover:border-brand-textSecondary/40",
  danger:
    "bg-brand-alert text-white hover:bg-brand-alert/90 border border-transparent shadow-[0_0_20px_-4px_rgba(220,38,38,0.4)]",
  whatsapp:
    "bg-[#25D366] text-brand-bg font-bold hover:bg-[#25D366]/90 border border-transparent shadow-[0_0_20px_-4px_rgba(37,211,102,0.35)]",
  ghost:
    "bg-transparent text-brand-textSecondary hover:text-brand-textPrimary hover:bg-brand-surfaceHover border border-transparent",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "min-h-[48px] px-4 py-2 text-sm rounded-xl gap-2",
  md: "min-h-[48px] px-5 py-2.5 text-sm sm:text-base rounded-xl gap-2.5",
  lg: "min-h-[52px] px-7 py-3.5 text-base rounded-xl gap-3",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center font-semibold tracking-wide transition-all duration-200 select-none cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg",
          "active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin shrink-0" aria-hidden="true" />
        ) : (
          leftIcon && <span className="shrink-0 inline-flex">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="shrink-0 inline-flex">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
