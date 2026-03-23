"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Panel from "@/components/shared/Panel";
import CropMarks from "@/components/shared/CropMarks";
import loreChapters from "@/data/lore-chapters.json";

interface LoreChapter {
  id: string;
  title: string;
  order: number;
  page_ref: number;
  content: string;
}

const chapters = (loreChapters as LoreChapter[]).sort((a, b) => a.order - b.order);

export default function LorePage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = chapters.find((c) => c.id === selectedId);
  const currentIdx = chapters.findIndex((c) => c.id === selectedId);

  if (chapters.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="mb-6">
          <span className="text-micro text-dark-50 block mb-1">CORE &gt; LORE</span>
          <h1 className="text-display-title text-dark m-0">The World of Hardwar</h1>
        </div>
        <Panel statusTape="muted">
          <p className="text-body text-dark-50">Lore content is being prepared.</p>
        </Panel>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="text-micro text-dark-50 block mb-1">CORE &gt; LORE</span>
          <h1 className="text-display-title text-dark m-0">The World of Hardwar</h1>
        </div>
        <span className="text-micro text-dark-50">{chapters.length} CHAPTERS</span>
      </div>

      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div
            key="chapter"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            <button
              onClick={() => setSelectedId(null)}
              className="text-meta text-dark-50 hover:text-dark bg-transparent border border-dark-20 hover:border-dark-50 px-3 py-1.5 cursor-pointer transition-colors mb-6"
            >
              &larr; ALL CHAPTERS
            </button>

            <div className="max-w-3xl mx-auto">
              <Panel statusTape="accent">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-micro text-accent-dark block mb-1">
                      CHAPTER {String(selected.order).padStart(2, "0")}
                    </span>
                    <h2 className="text-display-title text-dark m-0">{selected.title}</h2>
                  </div>
                  <span className="text-micro text-dark-50">p.{selected.page_ref}</span>
                </div>

                <div>
                  {selected.content.split("\n\n").map((paragraph, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="text-body text-secondary leading-relaxed"
                      style={{ marginBottom: "1.5em" }}
                    >
                      {paragraph}
                    </motion.p>
                  ))}
                </div>
              </Panel>

              {/* Chapter navigation */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => currentIdx > 0 && setSelectedId(chapters[currentIdx - 1].id)}
                  disabled={currentIdx <= 0}
                  className="text-meta text-dark-50 hover:text-dark bg-transparent border border-dark-20 hover:border-dark-50 px-4 py-2 cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  &larr; PREVIOUS
                </button>
                <button
                  onClick={() =>
                    currentIdx < chapters.length - 1 && setSelectedId(chapters[currentIdx + 1].id)
                  }
                  disabled={currentIdx >= chapters.length - 1}
                  className="text-meta text-dark hover:text-dark bg-transparent border border-dark-20 hover:border-dark-50 px-4 py-2 cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  NEXT &rarr;
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {chapters.map((ch, i) => (
                <motion.button
                  key={ch.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  onClick={() => setSelectedId(ch.id)}
                  className="relative text-left p-5 border border-dark-20 bg-bg-card cursor-pointer transition-all duration-200 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:border-dark-50"
                >
                  <CropMarks size={10} />
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-accent" aria-hidden />
                  <span className="text-micro text-dark-50 block mb-2">
                    {String(ch.order).padStart(2, "0")}
                  </span>
                  <h3 className="text-display-card text-dark m-0 mb-2">{ch.title}</h3>
                  <p className="text-body-sm text-dark-50 m-0 line-clamp-3">
                    {ch.content.slice(0, 200)}...
                  </p>
                  <span className="text-micro text-dark-50 block mt-3">p.{ch.page_ref}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
