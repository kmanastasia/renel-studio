import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Zap, AlertTriangle } from "lucide-react";
import MbtiCharacter from "./MbtiCharacter";
import { MBTI_TYPES } from "@/lib/mbtiData";

export default function MemberProfileCard({ participant, index }) {
  const [open, setOpen] = useState(false);
  const t = MBTI_TYPES[participant.type];
  if (!t) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/40 transition-colors"
      >
        <div className="flex-shrink-0">
          <MbtiCharacter type={participant.type} size={56} showLabel={false} animate={false} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-extrabold text-sm tracking-wider">
            {participant.name || `メンバー ${index + 1}`}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            <span className="font-bold text-foreground">{participant.type}</span>
            {" "}·{" "}
            <span>{t.desc}</span>
          </p>
        </div>
        <div className="flex-shrink-0 text-muted-foreground">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-border pt-4">
              {/* Strengths */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Zap className="w-3.5 h-3.5 text-[#FFE234]" />
                  <span className="font-display font-extrabold text-xs tracking-wider uppercase">強み</span>
                </div>
                <ul className="space-y-1.5">
                  {t.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <span className="font-display font-bold text-[#2ECC71] shrink-0 mt-0.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="leading-relaxed text-foreground/80">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Weaknesses */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#FF6B4A]" />
                  <span className="font-display font-extrabold text-xs tracking-wider uppercase">弱み</span>
                </div>
                <ul className="space-y-1.5">
                  {t.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <span className="font-display font-bold text-[#FF6B4A] shrink-0 mt-0.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="leading-relaxed text-foreground/80">{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}