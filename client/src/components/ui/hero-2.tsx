"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface AuroraHeroProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Injects the CSS keyframes for the aurora animation.
 */
const AuroraAnimation = () => (
  <style>
    {`
      @keyframes aurora-1 {
        0% { transform: translate(0%, 0%) scale(1); }
        25% { transform: translate(20%, -20%) scale(1.2); }
        50% { transform: translate(-20%, 20%) scale(0.8); }
        75% { transform: translate(10%, -10%) scale(1.1); }
        100% { transform: translate(0%, 0%) scale(1); }
      }
      @keyframes aurora-2 {
        0% { transform: translate(0%, 0%) scale(1); }
        25% { transform: translate(-20%, 20%) scale(1.1); }
        50% { transform: translate(20%, -20%) scale(0.9); }
        75% { transform: translate(-10%, 10%) scale(1.2); }
        100% { transform: translate(0%, 0%) scale(1); }
      }
    `}
  </style>
);

export const AuroraHero = ({ children, className }: AuroraHeroProps) => {
  return (
    <div className="h-full w-full">
      <div
        className={cn(
          "relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-white antialiased",
          className
        )}
      >
        {/* Content */}
        <div className="relative z-10 w-full">{children}</div>
      </div>
    </div>
  );
};
