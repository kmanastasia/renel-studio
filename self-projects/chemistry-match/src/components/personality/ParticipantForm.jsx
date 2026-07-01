import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, ArrowLeft } from "lucide-react";
import { PERSONALITY_TYPES } from "@/lib/personalityData";
import PersonalityCharacter from "./PersonalityCharacter";
import TypeSelector from "./TypeSelector";

export default function ParticipantForm({ participants, setParticipants, onBack }) {
  const [editingIndex, setEditingIndex] = useState(null);

  const addParticipant = () => {
    if (participants.length >= 6) return;
    setParticipants([...participants, { name: "", type: "" }]);
    setEditingIndex(participants.length);
  };

  const removeParticipant = (index) => {
    if (participants.length <= 2) return;
    setParticipants(participants.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const updateParticipant = (index, field, value) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: value };
    setParticipants(updated);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> 戻る
      </button>

      <h2 className="font-display font-extrabold text-3xl md:text-5xl tracking-tight mb-2 break-words">
        ADD YOUR<br />
        <span className="text-[#FFE234]">MEMBERS</span>
      </h2>
      <p className="text-muted-foreground mb-8 text-sm">
        参加者の名前とタイプを入力（2〜6人）
      </p>

      <div className="space-y-4">
        <AnimatePresence>
          {participants.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-card border border-border rounded-2xl p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 pt-1">
                  {p.type ? (
                    <PersonalityCharacter type={p.type} size={64} showLabel={false} />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                      <span className="text-2xl text-muted-foreground font-display font-extrabold">
                        {i + 1}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Input
                      placeholder={`メンバー ${i + 1} の名前`}
                      value={p.name}
                      onChange={(e) => updateParticipant(i, "name", e.target.value)}
                      className="font-body text-base border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground"
                    />
                    {participants.length > 2 && (
                      <button
                        onClick={() => removeParticipant(i)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {editingIndex === i ? (
                    <TypeSelector
                      selected={p.type}
                      onSelect={(type) => {
                        updateParticipant(i, "type", type);
                        setEditingIndex(null);
                      }}
                    />
                  ) : (
                    <button
                      onClick={() => setEditingIndex(i)}
                      className={`text-sm font-display font-bold tracking-wider uppercase px-3 py-1.5 rounded-full border transition-all ${
                        p.type
                          ? "border-foreground bg-foreground text-background"
                          : "border-dashed border-muted-foreground text-muted-foreground hover:border-foreground hover:text-foreground"
                      }`}
                    >
                      {p.type ? `${p.type} · ${PERSONALITY_TYPES[p.type]?.desc}` : "タイプを選択"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {participants.length < 6 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addParticipant}
          className="w-full mt-4 py-4 rounded-2xl border-2 border-dashed border-border hover:border-foreground/30 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="font-display font-bold text-sm tracking-wider uppercase">メンバーを追加</span>
        </motion.button>
      )}
    </div>
  );
}