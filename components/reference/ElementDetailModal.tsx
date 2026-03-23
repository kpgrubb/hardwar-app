"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import type { ElementStatCard, KeywordDefinition } from "@/types";
import StatCell from "@/components/shared/StatCell";
import CropMarks from "@/components/shared/CropMarks";
import keywordsData from "@/data/keywords.json";
import loreData from "@/data/element-lore.json";

const elementLore = loreData as Record<string, { flavor: string; lore: string }>;

const allKeywords = keywordsData as KeywordDefinition[];
const keywordMap = new Map<string, KeywordDefinition>();
for (const kw of allKeywords) {
  keywordMap.set(kw.term.toLowerCase(), kw);
  for (const alias of kw.aliases) keywordMap.set(alias.toLowerCase(), kw);
}

function lookupKeyword(term: string): KeywordDefinition | undefined {
  return keywordMap.get(term.toLowerCase());
}

interface Props {
  element: ElementStatCard;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export default function ElementDetailModal({ element, onClose, onPrev, onNext, hasPrev, hasNext }: Props) {
  const { stats } = element;
  const damageBoxes = Array.from({ length: stats.A }, (_, i) => i);
  const lore = elementLore[element.id];

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev && onPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext && onNext) onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  const allTerms = [
    ...element.special_rules,
    ...element.weapon_upgrades.map((w) => w.name),
    ...element.performance_upgrades,
    element.motive_type,
  ];
  const resolvedKeywords = allTerms
    .map((t) => ({ term: t, kw: lookupKeyword(t) }))
    .filter((entry) => entry.kw);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-dark/40 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-card border border-dark-20 w-full max-w-2xl max-h-[85vh] overflow-y-auto relative"
      >
        <CropMarks size={16} />

        {/* Header */}
        <div className="bg-dark flex items-center justify-between px-6 py-4 sticky top-0 z-10">
          <div>
            <h2 className="text-display-title text-white m-0">{element.name}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-micro text-dark-50">{element.faction}</span>
              <span className="text-micro text-dark-50">{element.motive_type}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-meta font-bold bg-accent text-dark px-3 py-1">
              C{element.class}
            </span>
            <div className="flex gap-1 ml-2">
              <button
                onClick={onPrev}
                disabled={!hasPrev}
                className="text-meta text-dark-50 hover:text-white bg-transparent border border-dark-50/30 w-8 h-8 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                aria-label="Previous element"
              >
                &larr;
              </button>
              <button
                onClick={onNext}
                disabled={!hasNext}
                className="text-meta text-dark-50 hover:text-white bg-transparent border border-dark-50/30 w-8 h-8 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                aria-label="Next element"
              >
                &rarr;
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-meta text-dark-50 hover:text-white bg-transparent border border-dark-50/30 px-2 py-1 cursor-pointer transition-colors ml-1"
            >
              ESC
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Flavor text */}
          {lore?.flavor && (
            <div className="mb-6 border-l-4 border-accent pl-4 py-2 bg-accent-glow">
              <p className="text-body text-dark m-0 italic leading-relaxed">
                {lore.flavor}
              </p>
            </div>
          )}

          {/* Lore */}
          {lore?.lore && (
            <div className="mb-6">
              <span className="text-display-section text-dark-50 block mb-2">OPERATIONAL HISTORY</span>
              <p className="text-body-sm text-secondary m-0 leading-relaxed">
                {lore.lore}
              </p>
            </div>
          )}

          {/* Stat Grid */}
          <div className="grid grid-cols-5 gap-0 mb-6">
            <StatCell label="m" value={stats.M} />
            <StatCell label="f" value={stats.F} />
            <StatCell label="d" value={stats.D} />
            <StatCell label="a" value={stats.A} />
            <StatCell label="c" value={stats.C} />
          </div>

          {/* Damage Bar */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-micro text-dark-50 w-16">DAMAGE BAR</span>
            <div className="flex gap-1 flex-1">
              {damageBoxes.map((i) => (
                <div key={i} className="w-4 h-4 border border-dark-20 bg-bg-primary" />
              ))}
            </div>
          </div>

          {/* Keyword Glossary — full definitions */}
          {resolvedKeywords.length > 0 && (
            <div className="border-t border-dark-20 pt-4">
              <span className="text-display-section text-dark-50 block mb-4">
                ABILITIES & RULES
              </span>
              <div className="space-y-3">
                {resolvedKeywords.map(({ term, kw }) => (
                  <div key={term} className="border-l-2 border-accent pl-4 py-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-display-section text-dark">{term}</span>
                      {kw && (
                        <span className="text-micro text-dark-50">
                          p.{kw.page_ref_core}
                        </span>
                      )}
                    </div>
                    {kw && (
                      <p className="text-body-sm text-secondary m-0 leading-relaxed">
                        {kw.definition_core}
                      </p>
                    )}
                    {kw?.definition_quickplay && (
                      <p className="text-body-sm text-dark-50 m-0 mt-1 italic">
                        Quickplay: {kw.definition_quickplay}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weapon Upgrades Detail */}
          {element.weapon_upgrades.length > 0 && (
            <div className="border-t border-dark-20 pt-4 mt-4">
              <span className="text-display-section text-dark-50 block mb-3">
                WEAPON SYSTEMS
              </span>
              {element.weapon_upgrades.map((w, i) => (
                <div key={i} className="flex items-center gap-4 mb-2 bg-surface px-3 py-2 border border-dark-20">
                  <span className="text-display-section text-dark">{w.name}</span>
                  {w.f_bonus !== 0 && (
                    <span className="text-meta text-accent-dark">
                      F{w.f_bonus > 0 ? "+" : ""}{w.f_bonus}
                    </span>
                  )}
                  {w.notes && (
                    <span className="text-micro text-dark-50">{w.notes}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Page Reference */}
          <div className="border-t border-dark-20 pt-4 mt-4 flex justify-between">
            <span className="text-micro text-dark-50">
              SOURCE: HARDWAR CORE RULEBOOK
            </span>
            <span className="text-meta text-dark">p.{element.page_ref}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
