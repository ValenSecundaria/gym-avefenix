"use client";

import React, { useRef } from "react";

interface MagneticTiltCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Tarjeta con micro-inclinación 3D (±2.5deg) y destello sutil al puntero del mouse.
 * Usa variables CSS directas en el DOM para evitar re-renders y mantener 60fps.
 */
export function MagneticTiltCard({ children, className = "" }: MagneticTiltCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const nx = x / rect.width - 0.5;
    const ny = y / rect.height - 0.5;

    el.style.setProperty("--px", `${x.toFixed(1)}px`);
    el.style.setProperty("--py", `${y.toFixed(1)}px`);
    el.style.setProperty("--rx", `${(-ny * 4.5).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(nx * 4.5).toFixed(2)}deg`);
    el.style.setProperty("--spot-opacity", "1");
  };

  const handlePointerLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--spot-opacity", "0");
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        transform: "perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
        transition: "transform 220ms cubic-bezier(0.22, 1, 0.36, 1), border-color 200ms ease",
        willChange: "transform",
      }}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Destello sutil que sigue al puntero */}
      <div
        aria-hidden="true"
        style={{
          opacity: "var(--spot-opacity, 0)",
          transition: "opacity 250ms ease",
          background:
            "radial-gradient(240px circle at var(--px, 50%) var(--py, 50%), color-mix(in srgb, var(--brand-primary) 16%, transparent), transparent 70%)",
        }}
        className="pointer-events-none absolute inset-0"
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
