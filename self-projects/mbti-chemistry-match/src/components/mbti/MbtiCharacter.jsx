import React from "react";
import { motion } from "framer-motion";
import { Avatar } from "@humation/react";
import { humation1 } from "@humation/assets-humation-1";
import { MBTI_TYPES } from "@/lib/mbtiData";

// MBTI 4グループ × 個性に合わせた配色
// NT (Analysts): クール系ブルー・ネイビー（知的・論理的）
// NF (Diplomats): ウォーム系パープル・コーラル（共感・理想）
// SJ (Sentinels): アース系ブラウン・グリーン（安定・誠実）
// SP (Explorers): ビビッド系オレンジ・ピンク（行動・自由）
const MBTI_COLORS = {
  INTJ: { hair: '1a1a2e', clothes: '16213e', skin: 'f4c7a0', bottom: '0f3460' },
  INTP: { hair: '3d5a80', clothes: '293241', skin: 'f4c7a0', bottom: '1b2a4a' },
  ENTJ: { hair: '1A1A2E', clothes: '0f3460', skin: 'deb887', bottom: '16213e' },
  ENTP: { hair: '5c4b8b', clothes: '6B48FF', skin: 'f4c7a0', bottom: '4b0082' },

  INFJ: { hair: '4a235a', clothes: '5c4777', skin: 'f4c7a0', bottom: '6c3483' },
  INFP: { hair: 'c17ba0', clothes: 'ce93d8', skin: 'ffe4c4', bottom: '9b59b6' },
  ENFJ: { hair: '8b4513', clothes: 'e74c3c', skin: 'deb887', bottom: 'c0392b' },
  ENFP: { hair: 'e67e22', clothes: 'f39c12', skin: 'f4c7a0', bottom: 'e74c3c' },

  ISTJ: { hair: '2f1b0e', clothes: '4a3728', skin: 'deb887', bottom: '3b2f2f' },
  ISFJ: { hair: '5d4e37', clothes: '27ae60', skin: 'ffd3b6', bottom: '1e8449' },
  ESTJ: { hair: '3c2415', clothes: '784212', skin: 'deb887', bottom: '5d4037' },
  ESFJ: { hair: 'daa520', clothes: 'e67e22', skin: 'ffe4b5', bottom: 'd68910' },

  ISTP: { hair: '2f4f4f', clothes: '2e4057', skin: 'c8a97e', bottom: '1c3a3a' },
  ISFP: { hair: 'ad1457', clothes: 'ce93d8', skin: 'ffe4c4', bottom: '8e24aa' },
  ESTP: { hair: 'bf360c', clothes: 'e64a19', skin: 'deb887', bottom: 'd84315' },
  ESFP: { hair: 'd81b60', clothes: 'f06292', skin: 'ffd3b6', bottom: 'c2185b' },
};

export default function MbtiCharacter({ type, size = 96, showLabel = true, animate = true }) {
  if (!type || !MBTI_TYPES[type]) return null;
  const t = MBTI_TYPES[type];
  const colors = MBTI_COLORS[type] ?? {};

  const Wrapper = animate ? motion.div : "div";
  const wrapperProps = animate
    ? {
        initial: { scale: 0, rotate: -10 },
        animate: { scale: 1, rotate: 0 },
        whileHover: { scale: 1.1, y: -4, transition: { type: "spring", stiffness: 400, damping: 10 } },
        transition: { type: "spring", stiffness: 300, damping: 15 },
      }
    : {};

  return (
    <Wrapper {...wrapperProps} className="flex flex-col items-center gap-1">
      <div
        className="rounded-2xl overflow-hidden bg-white shadow-sm border border-border/50 flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <Avatar
          assets={humation1}
          seed={type}
          size={size}
          colors={{ background: 'transparent', ...colors }}
        />
      </div>
      {showLabel && (
        <div className="text-center">
          <p className="font-display font-extrabold text-xs tracking-wider uppercase">{type}</p>
          <p className="text-[10px] text-muted-foreground">{t.desc}</p>
        </div>
      )}
    </Wrapper>
  );
}
