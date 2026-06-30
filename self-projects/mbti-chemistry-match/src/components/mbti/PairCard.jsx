import React from "react";
import { motion } from "framer-motion";
import MbtiCharacter from "./MbtiCharacter";
import CountUpScore from "./CountUpScore";

function getScoreColor(score) {
  if (score >= 85) return "#2ECC71";
  if (score >= 65) return "#FFE234";
  if (score >= 50) return "#F39C12";
  return "#FF6B4A";
}

export default function PairCard({ pair, comment, index }) {
  const color = getScoreColor(pair.score);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <MbtiCharacter type={pair.person1.type} size={56} showLabel={false} />
          <div className="text-center">
            <div
              className="font-display font-extrabold text-2xl"
              style={{ color }}
            >
              <CountUpScore target={pair.score} duration={1500} />
              <span className="text-sm">%</span>
            </div>
          </div>
          <MbtiCharacter type={pair.person2.type} size={56} showLabel={false} />
        </div>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-body font-bold text-sm">{pair.person1.name}</span>
        <span className="text-muted-foreground text-xs">×</span>
        <span className="font-body font-bold text-sm">{pair.person2.name}</span>
      </div>
      <div className="flex items-center gap-1 mb-3">
        <span className="font-display text-[10px] font-bold tracking-wider uppercase bg-muted px-2 py-0.5 rounded-full">
          {pair.person1.type}
        </span>
        <span className="text-muted-foreground text-xs">×</span>
        <span className="font-display text-[10px] font-bold tracking-wider uppercase bg-muted px-2 py-0.5 rounded-full">
          {pair.person2.type}
        </span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{comment}</p>
    </motion.div>
  );
}