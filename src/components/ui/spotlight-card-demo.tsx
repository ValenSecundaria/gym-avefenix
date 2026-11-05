"use client";

import React from "react";
import { GlowCard } from "@/components/ui/spotlight-card";

export function Default() {
  return (
    <div className="w-screen h-screen flex flex-row items-center justify-center gap-10 custom-cursor bg-[#0B0B0C]">
      <GlowCard glowColor="orange" />
      <GlowCard glowColor="orange" />
      <GlowCard glowColor="orange" />
    </div>
  );
}

