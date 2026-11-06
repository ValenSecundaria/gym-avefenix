"use client";

import React, { useEffect, useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
  glowColor?: "blue" | "purple" | "green" | "red" | "orange";
  size?: "sm" | "md" | "lg";
  width?: string | number;
  height?: string | number;
  customSize?: boolean; // When true, ignores size prop and uses width/height or className
}

const glowColorMap = {
  blue: { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green: { base: 120, spread: 200 },
  red: { base: 0, spread: 200 },
  // Naranja predominante afinado a la identidad de Ave Fénix (#F95716 -> #FFB300)
  orange: { base: 18, spread: 25 },
};

const sizeMap = {
  sm: "w-48 h-64",
  md: "w-64 h-80",
  lg: "w-80 h-96",
};

const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = "",
  glowColor = "orange",
  size = "md",
  width,
  height,
  customSize = false,
  ...rest
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Desactivado completamente en móviles y tablets: solo corre en pantallas >= 1024px con puntero fino (mouse)
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)");
    if (!mediaQuery.matches) {
      return;
    }

    const syncPointer = (e: PointerEvent) => {
      const { clientX: x, clientY: y } = e;

      if (cardRef.current) {
        cardRef.current.style.setProperty("--x", x.toFixed(2));
        cardRef.current.style.setProperty("--xp", (x / window.innerWidth).toFixed(2));
        cardRef.current.style.setProperty("--y", y.toFixed(2));
        cardRef.current.style.setProperty("--yp", (y / window.innerHeight).toFixed(2));
      }
    };

    document.addEventListener("pointermove", syncPointer, { passive: true });
    return () => document.removeEventListener("pointermove", syncPointer);
  }, []);

  const { base, spread } = glowColorMap[glowColor] || glowColorMap.orange;

  // Determine sizing
  const getSizeClasses = () => {
    if (customSize) {
      return ""; // Let className or inline styles handle sizing
    }
    return sizeMap[size];
  };

  const getInlineStyles = () => {
    const baseStyles: React.CSSProperties & Record<string, string | number> = {
      "--base": base,
      "--spread": spread,
      "--radius": "16",
      "--border": "1",
      "--backdrop": "rgba(23, 23, 28, 0.8)",
      "--backup-border": "rgba(44, 45, 53, 0.85)",
      "--size": "280",
      "--outer": "1",
      "--border-size": "calc(var(--border, 1) * 1px)",
      "--spotlight-size": "calc(var(--size, 280) * 1px)",
      "--hue": "calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))",
      backgroundColor: "var(--backdrop, #17171C)",
      backgroundSize: "calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))",
      backgroundPosition: "50% 50%",
      backgroundAttachment: "fixed",
      border: "var(--border-size) solid var(--backup-border)",
      position: "relative" as const,
      touchAction: "pan-y" as const,
    };

    // Add width and height if provided
    if (width !== undefined) {
      baseStyles.width = typeof width === "number" ? `${width}px` : width;
    }
    if (height !== undefined) {
      baseStyles.height = typeof height === "number" ? `${height}px` : height;
    }

    return baseStyles;
  };

  const beforeAfterStyles = `
    /* En mobile y tablets: animación y spotlight totalmente desactivados */
    [data-glow] {
      background-image: none;
    }

    /* Solo en desktop con mouse preciso (>= 1024px y hover: hover): activar spotlight */
    @media (hover: hover) and (pointer: fine) and (min-width: 1024px) {
      [data-glow] {
        background-image: radial-gradient(
          var(--spotlight-size) var(--spotlight-size) at
          calc(var(--x, 0) * 1px)
          calc(var(--y, 0) * 1px),
          hsl(var(--hue, 18) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 60) * 1%) / var(--bg-spot-opacity, 0.12)), transparent
        );
      }

      [data-glow]::before,
      [data-glow]::after {
        pointer-events: none;
        content: "";
        position: absolute;
        inset: calc(var(--border-size) * -1);
        border: var(--border-size) solid transparent;
        border-radius: calc(var(--radius) * 1px);
        background-attachment: fixed;
        background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
        background-repeat: no-repeat;
        background-position: 50% 50%;
        mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
        mask-clip: padding-box, border-box;
        mask-composite: intersect;
        -webkit-mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
        -webkit-mask-clip: padding-box, border-box;
        -webkit-mask-composite: source-in, xor;
      }
      
      [data-glow]::before {
        background-image: radial-gradient(
          calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
          calc(var(--x, 0) * 1px)
          calc(var(--y, 0) * 1px),
          hsl(var(--hue, 18) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 50) * 1%) / var(--border-spot-opacity, 1)), transparent 100%
        );
        filter: brightness(2);
      }
      
      [data-glow]::after {
        background-image: radial-gradient(
          calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
          calc(var(--x, 0) * 1px)
          calc(var(--y, 0) * 1px),
          hsl(0 100% 100% / var(--border-light-opacity, 0.8)), transparent 100%
        );
      }
      
      [data-glow] [data-glow] {
        position: absolute;
        inset: 0;
        will-change: filter;
        opacity: var(--outer, 1);
        border-radius: calc(var(--radius) * 1px);
        border-width: calc(var(--border-size) * 20);
        filter: blur(calc(var(--border-size) * 10));
        background: none;
        pointer-events: none;
        border: none;
      }
      
      [data-glow] > [data-glow]::before {
        inset: -10px;
        border-width: 10px;
      }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: beforeAfterStyles }} />
      <div
        ref={cardRef}
        data-glow
        style={getInlineStyles()}
        className={cn(
          getSizeClasses(),
          !customSize && "aspect-[3/4] grid grid-rows-[1fr_auto] p-4 gap-4",
          "rounded-2xl relative shadow-[0_1rem_2rem_-1rem_black] backdrop-blur-[5px]",
          className
        )}
        {...rest}
      >
        <div ref={innerRef} data-glow className="pointer-events-none absolute inset-0 hidden lg:block" />
        {children}
      </div>
    </>
  );
};

export { GlowCard, GlowCard as SpotlightCard };
