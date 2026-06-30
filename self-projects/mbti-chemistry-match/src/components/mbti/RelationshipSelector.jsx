import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { RELATIONSHIP_TYPES } from "@/lib/mbtiData";

export default function RelationshipSelector({ selected, onSelect, onBack }) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> 戻る
      </button>

      <h2 className="font-display font-extrabold text-3xl md:text-5xl tracking-tight text-center mb-2">
        CHOOSE YOUR<br />
        <span className="text-[#FF6B4A]">RELATIONSHIP</span>
      </h2>
      <p className="text-center text-muted-foreground mb-8 text-sm">
        関係性を選んでください
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {RELATIONSHIP_TYPES.map((rel) => (
          <motion.button
            key={rel.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(rel.id)}
            className={`relative rounded-2xl border-2 p-5 text-left transition-all ${
              selected === rel.id
                ? "border-foreground bg-foreground text-background shadow-lg"
                : "border-border bg-card hover:border-foreground/30"
            }`}
          >
            <span className="text-2xl mb-2 block">{rel.emoji}</span>
            <span className="font-display font-extrabold text-xs tracking-wider uppercase block">
              {rel.en}
            </span>
            <span className="text-sm mt-1 block opacity-80">{rel.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}