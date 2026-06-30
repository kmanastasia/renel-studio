import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import MbtiCharacter from "./MbtiCharacter";
import CountUpScore from "./CountUpScore";
import PairCard from "./PairCard";
import Marquee from "./Marquee";
import {
  calculateGroupChemistry,
  getPairComment,
  getGroupInsights,
  RELATIONSHIP_TYPES,
} from "@/lib/mbtiData";
import MemberProfileCard from "./MemberProfileCard";

function getScoreLabel(score) {
  if (score >= 85) return { text: "PERFECT MATCH", color: "#2ECC71" };
  if (score >= 70) return { text: "GREAT CHEMISTRY", color: "#FFE234" };
  if (score >= 55) return { text: "GOOD VIBES", color: "#F39C12" };
  return { text: "UNIQUE COMBO", color: "#FF6B4A" };
}

export default function ResultsView({ participants, relationship, onReset }) {
  const { pairs, avgScore } = calculateGroupChemistry(participants, relationship);
  const insights = getGroupInsights(participants, relationship);
  const relInfo = RELATIONSHIP_TYPES.find((r) => r.id === relationship);
  const scoreLabel = getScoreLabel(avgScore);

  const shareText = `【MBTI Chemistry Match】\n${participants.map(p => `${p.name}(${p.type})`).join(' × ')} の相性は ${avgScore}% — ${scoreLabel.text}！`;

  const handleXShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener');
  };

  const handleInstagramShare = async () => {
    await navigator.clipboard.writeText(shareText);
    toast.success('コピーしました！Instagramに貼り付けてください 📋');
  };

  const handleLineShare = () => {
    const url = `https://social-plugins.line.me/lineit/share?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener');
  };

  return (
    <div className="min-h-screen bg-background">
      <Marquee />
      
      {/* Hero Score Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-[#FFE234] opacity-20 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-[#FF6B4A] opacity-15 blur-3xl" />
        </div>
        <div className="relative px-5 py-12 md:py-20 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="font-display font-extrabold text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
              {relInfo?.emoji} {relInfo?.en} CHEMISTRY
            </p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="mb-4"
          >
            <div className="font-display font-extrabold text-[80px] md:text-[120px] leading-none tracking-tighter">
              <CountUpScore target={avgScore} duration={2500} />
              <span className="text-[40px] md:text-[60px]">%</span>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="font-display font-extrabold text-xl md:text-2xl tracking-wider uppercase"
            style={{ color: scoreLabel.color }}
          >
            {scoreLabel.text}
          </motion.p>

          {/* Characters Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-end justify-center gap-3 md:gap-5 mt-8"
          >
            {participants.map((p, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="block md:hidden">
                  <MbtiCharacter type={p.type} size={64} />
                </div>
                <div className="hidden md:block">
                  <MbtiCharacter type={p.type} size={96} />
                </div>
                <p className="font-body font-bold text-xs mt-1 truncate max-w-[80px]">{p.name}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <Marquee />

      {/* Pair Results */}
      <div className="px-5 py-12 max-w-4xl mx-auto">
        <h3 className="font-display font-extrabold text-2xl md:text-4xl tracking-tight mb-2">
          PAIR<br />
          <span className="text-[#FF6B4A]">ANALYSIS</span>
        </h3>
        <p className="text-muted-foreground text-sm mb-8">全ペアの相性診断</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pairs.map((pair, i) => (
            <PairCard
              key={i}
              pair={pair}
              comment={getPairComment(pair.person1.type, pair.person2.type, relationship, pair.score)}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* Group Insights */}
      <div className="bg-muted">
        <div className="px-5 py-12 max-w-4xl mx-auto">
          <h3 className="font-display font-extrabold text-2xl md:text-4xl tracking-tight mb-8">
            GROUP<br />
            <span className="text-[#FFE234]">INSIGHTS</span>
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-2xl p-6 border border-border"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#FFE234]" />
                <h4 className="font-display font-extrabold text-sm tracking-wider uppercase">
                  STRENGTHS
                </h4>
              </div>
              <ul className="space-y-3">
                {insights.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="font-display font-extrabold text-xs text-[#2ECC71] mt-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-2xl p-6 border border-border"
            >
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-[#FF6B4A]" />
                <h4 className="font-display font-extrabold text-sm tracking-wider uppercase">
                  WATCH OUT
                </h4>
              </div>
              <ul className="space-y-3">
                {insights.cautions.map((c, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="font-display font-extrabold text-xs text-[#FF6B4A] mt-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Member Profiles */}
      <div className="px-5 py-12 max-w-4xl mx-auto">
        <h3 className="font-display font-extrabold text-2xl md:text-4xl tracking-tight mb-2">
          MEMBER<br />
          <span className="text-[#FFE234]">PROFILES</span>
        </h3>
        <p className="text-muted-foreground text-sm mb-6">各メンバーの特性・強み・弱み</p>
        <div className="space-y-3">
          {participants.map((p, i) => (
            <MemberProfileCard key={i} participant={p} index={i} />
          ))}
        </div>
      </div>

      <Marquee />

      {/* Footer Actions */}
      <div className="px-5 py-12 text-center max-w-2xl mx-auto">
        {/* SNS シェア */}
        <div className="mb-6">
          <p className="text-xs text-muted-foreground font-display tracking-wider uppercase mb-3">SHARE RESULT</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleXShare}
              aria-label="Xでシェア"
              className="rounded-full w-12 h-12 border-2 border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
            <button
              onClick={handleInstagramShare}
              aria-label="Instagram用にコピー"
              className="rounded-full w-12 h-12 border-2 border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </button>
            <button
              onClick={handleLineShare}
              aria-label="LINEでシェア"
              className="rounded-full w-12 h-12 border-2 border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
            </button>
          </div>
        </div>

        {/* もう一度やる */}
        <Button
          onClick={onReset}
          variant="outline"
          className="rounded-full px-8 py-6 font-display font-extrabold text-sm tracking-wider uppercase border-2 hover:bg-foreground hover:text-background transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          もう一度やる
        </Button>
      </div>

      <Marquee />
    </div>
  );
}