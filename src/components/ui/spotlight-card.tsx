"use client";

import React, { useEffect, useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { glowColorMap, sizeMap, beforeAfterStyles } from "./spotlight-styles";

export interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
  glowColor?: "blue" | "purple" | "green" | "red" | "orange";
  size?: "sm" | "md" | "lg";
  width?: string | number;
  height?: string | number;
  customSize?: boolean;
}

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
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)");
    if (!mediaQuery.matches) return;

    const syncPointer = (e: PointerEvent) => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty("--x", x.toFixed(2));
      card.style.setProperty("--y", y.toFixed(2));

      if (innerRef.current) {
        innerRef.current.style.setProperty("--x", x.toFixed(2));
        innerRef.current.style.setProperty("--y", y.toFixed(2));
      }
    };

    window.addEventListener("pointermove", syncPointer);
    return () => window.removeEventListener("pointermove", syncPointer);
  }, []);

  const getInlineStyles = () => {
    const colorConfig = glowColorMap[glowColor];
    const baseHue = colorConfig.base;
    const spread = colorConfig.spread;

    return {
      "--start": "0",
      "--hue": baseHue.toString(),
      "--spread": spread.toString(),
      "--radius": "16",
      "--border-size": "1",
      "--spotlight-size": "260px",
      "--border-light-opacity": "0.35",
      "--border-spot-opacity": "0.6",
      width: customSize ? (width ? (typeof width === "number" ? `${width}px` : width) : undefined) : undefined,
      height: customSize ? (height ? (typeof height === "number" ? `${height}px` : height) : undefined) : undefined,
    } as React.CSSProperties;
  };

  const getSizeClasses = () => {
    if (customSize) return "";
    return sizeMap[size];
  };

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
