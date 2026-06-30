import React from "react";
import { motion } from "framer-motion";
import { MBTI_TYPES } from "@/lib/mbtiData";

const typeOrder = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
];

const groupColors = {
  NT: "#9B59B6",
  NF: "#2ECC71",
  SJ: "#3498DB",
  SP: "#F39C12",
};

function getGroup(type) {
  if (type[1] === 'N' && type[2] === 'T') return 'NT';
  if (type[1] === 'N' && type[2] === 'F') return 'NF';
  if (type[1] === 'S' && type[3] === 'J') return 'SJ';
  return 'SP';
}

export default function MbtiTypeSelector({ selected, onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-2"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
        {typeOrder.map((type) => {
          const t = MBTI_TYPES[type];
          const group = getGroup(type);
          const isSelected = selected === type;
          return (
            <motion.button
              key={type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(type)}
              className={`relative text-left px-3 py-2 rounded-xl border transition-all text-xs ${
                isSelected
                  ? "border-foreground bg-foreground text-background shadow-md"
                  : "border-border hover:border-foreground/40 bg-card"
              }`}
            >
              <div
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ backgroundColor: groupColors[group] }}
              />
              <span className="font-display font-extrabold tracking-wider">{type}</span>
              <span className="block text-[10px] opacity-70 mt-0.5">{t.desc}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}