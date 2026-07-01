import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Marquee from "@/components/personality/Marquee";
import RelationshipSelector from "@/components/personality/RelationshipSelector";
import ParticipantForm from "@/components/personality/ParticipantForm";
import ResultsView from "@/components/personality/ResultsView";
import PersonalityCharacter from "@/components/personality/PersonalityCharacter";
import { PERSONALITY_TYPES } from "@/lib/personalityData";

const TYPE_ORDER = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP', // Analysts
  'INFJ', 'INFP', 'ENFJ', 'ENFP', // Diplomats
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', // Sentinels
  'ISTP', 'ISFP', 'ESTP', 'ESFP', // Explorers
];
const GROUP_LABELS = ['ANALYSTS', 'DIPLOMATS', 'SENTINELS', 'EXPLORERS'];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

export default function Home() {
  const [step, setStep] = useState(0); // 0=hero, 1=relationship, 2=participants, 3=results
  const [direction, setDirection] = useState(1);
  const [relationship, setRelationship] = useState("");
  const [participants, setParticipants] = useState([
    { name: "", type: "" },
    { name: "", type: "" },
  ]);
  const [selectedType, setSelectedType] = useState(null); // 詳細表示するタイプ

  const goTo = (s) => {
    setDirection(s > step ? 1 : -1);
    setStep(s);
  };

  const canSubmit = participants.length >= 2 &&
    participants.every((p) => p.name.trim() && p.type);

  const handleReset = () => {
    setRelationship("");
    setParticipants([{ name: "", type: "" }, { name: "", type: "" }]);
    goTo(0);
  };

  if (step === 3) {
    return <ResultsView participants={participants} relationship={relationship} onReset={handleReset} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between border-b border-border">
        <div className="font-display font-extrabold text-sm tracking-wider uppercase">
          CHEMISTRY<span className="text-[#FF6B4A]">MATCH</span>
        </div>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s <= step ? "bg-foreground w-6" : "bg-border w-3"
              }`}
            />
          ))}
        </div>
      </header>

      <Marquee />

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 && (
            <motion.div
              key="hero"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="text-center max-w-xl"
            >
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-display font-extrabold text-[48px] md:text-[80px] leading-[0.9] tracking-tighter mb-6 text-left w-full"
              >
                <span className="text-[#FFE234]">CHEMISTRY</span>
                <br />
                MATCH
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground text-sm md:text-base mb-10 max-w-sm mx-auto"
              >
                あなたたちの「相性」を16タイプで診断。
                <br />
                カップル・友達・職場チーム、どんな関係でもOK。
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={() => goTo(1)}
                  className="rounded-full px-10 py-7 font-display font-extrabold text-base tracking-wider uppercase bg-foreground text-background hover:bg-foreground/90 shadow-xl"
                >
                  START CHECK
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <div>
                  <Drawer
                    onOpenChange={(open) => {
                      if (!open) setSelectedType(null);
                    }}
                  >
                    <DrawerTrigger asChild>
                      <button
                        className="mt-3 text-sm text-muted-foreground font-display tracking-wider uppercase underline underline-offset-4 hover:text-foreground transition-colors"
                      >
                        TYPE GUIDE →
                      </button>
                    </DrawerTrigger>
                    <DrawerContent className="max-h-[85vh] overflow-y-auto">
                      <div className="max-w-2xl mx-auto w-full">
                        <DrawerHeader className="text-center">
                          <DrawerTitle className="font-display font-extrabold text-2xl tracking-tight">
                            TYPE GUIDE
                          </DrawerTitle>
                          <p className="text-sm text-muted-foreground">16タイプの特性を探る</p>
                        </DrawerHeader>

                        {selectedType === null ? (
                          // 16タイプグリッド
                          <div className="px-4 pb-8">
                            {GROUP_LABELS.map((groupLabel, gi) => (
                              <div key={groupLabel} className="mb-6">
                                <p className="text-[10px] text-muted-foreground/70 font-display tracking-[0.2em] uppercase mb-3 text-center">
                                  {groupLabel}
                                </p>
                                <div className="grid grid-cols-4 gap-2 sm:gap-4">
                                  {TYPE_ORDER.slice(gi * 4, gi * 4 + 4).map((type) => (
                                    <button
                                      key={type}
                                      onClick={() => setSelectedType(type)}
                                      className="flex flex-col items-center gap-1 rounded-2xl p-2 sm:p-3 hover:bg-muted transition-colors"
                                    >
                                      <PersonalityCharacter
                                        type={type}
                                        size={56}
                                        showLabel={false}
                                        animate={false}
                                      />
                                      <span className="font-display font-extrabold text-xs tracking-wider uppercase">
                                        {type}
                                      </span>
                                      <span className="text-[10px] text-muted-foreground leading-tight text-center">
                                        {PERSONALITY_TYPES[type].desc}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          // 詳細ビュー
                          <div className="px-5 pb-10 max-w-md mx-auto">
                            <button
                              onClick={() => setSelectedType(null)}
                              className="flex items-center gap-1 text-xs text-muted-foreground font-display tracking-wider uppercase hover:text-foreground transition-colors mb-6"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                              ALL TYPES
                            </button>

                            <div className="flex flex-col items-center text-center mb-8">
                              <PersonalityCharacter
                                type={selectedType}
                                size={96}
                                showLabel={false}
                                animate={false}
                              />
                              <h3 className="font-display font-extrabold text-4xl tracking-tight mt-4">
                                {selectedType}
                              </h3>
                              <p className="text-lg font-body font-bold mt-1">{PERSONALITY_TYPES[selectedType].desc}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-display font-extrabold text-sm tracking-wider uppercase text-[#2ECC71] mb-3">
                                  STRENGTHS
                                </h4>
                                <ul className="space-y-2">
                                  {PERSONALITY_TYPES[selectedType].strengths.map((s, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <span className="font-display font-extrabold text-xs text-[#2ECC71] mt-0.5">
                                        {String(i + 1).padStart(2, "0")}
                                      </span>
                                      <span className="text-sm leading-relaxed">{s}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-display font-extrabold text-sm tracking-wider uppercase text-[#FF6B4A] mb-3">
                                  WEAKNESSES
                                </h4>
                                <ul className="space-y-2">
                                  {PERSONALITY_TYPES[selectedType].weaknesses.map((w, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <span className="font-display font-extrabold text-xs text-[#FF6B4A] mt-0.5">
                                        {String(i + 1).padStart(2, "0")}
                                      </span>
                                      <span className="text-sm leading-relaxed">{w}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </DrawerContent>
                  </Drawer>
                </div>
              </motion.div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="relationship"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full"
            >
              <RelationshipSelector
                selected={relationship}
                onSelect={(id) => {
                  setRelationship(id);
                  setTimeout(() => goTo(2), 300);
                }}
                onBack={() => goTo(0)}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="participants"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full"
            >
              <ParticipantForm
                participants={participants}
                setParticipants={setParticipants}
                onBack={() => goTo(1)}
              />
              <div className="max-w-2xl mx-auto mt-8">
                <Button
                  onClick={() => goTo(3)}
                  disabled={!canSubmit}
                  className="w-full rounded-full py-7 font-display font-extrabold text-base tracking-wider uppercase bg-[#FF6B4A] hover:bg-[#FF6B4A]/90 text-white shadow-xl disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  CHEMISTRY CHECK
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}