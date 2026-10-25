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
    "bg-[#F95716] text-[#F4F5F7] hover:bg-[#F95716]/90 border border-transparent shadow-[0_0_20px_-4px_rgba(249,87,22,0.45)]",
  surface:
    "bg-[#17171C] text-[#F4F5F7] border border-[#2C2D35] hover:bg-[#23232A] hover:border-[#8A909A]/40",
  danger:
    "bg-[#D92614] text-[#F4F5F7] hover:bg-[#D92614]/90 border border-transparent shadow-[0_0_20px_-4px_rgba(217,38,20,0.4)]",
  whatsapp:
    "bg-[#25D366] text-[#0B0B0C] font-bold hover:bg-[#25D366]/90 border border-transparent shadow-[0_0_20px_-4px_rgba(37,211,102,0.35)]",
  ghost:
    "bg-transparent text-[#8A909A] hover:text-[#F4F5F7] hover:bg-[#23232A] border border-transparent",
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
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F95716] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0C]",
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
