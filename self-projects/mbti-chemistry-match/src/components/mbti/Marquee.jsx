import React from "react";

export default function Marquee() {
  const text = "CHEMISTRY MATCH · TYPE ANALYSIS · YOUR VIBE CHECK · PERSONALITY LAB · ";
  return (
    <div className="overflow-hidden bg-foreground text-background py-3 select-none">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...Array(4)].map((_, i) => (
          <span key={i} className="font-display font-extrabold text-sm tracking-[0.2em] uppercase mx-4">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}