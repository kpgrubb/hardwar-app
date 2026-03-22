"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ASCII_FRAMES } from "./AsciiArt";
import CropMarks from "@/components/shared/CropMarks";

const NAV_LINKS = [
  { href: "/learn", label: "LEARN THE RULES", code: "01" },
  { href: "/reference", label: "RULES REFERENCE", code: "02" },
  { href: "/session", label: "SESSION AID", code: "03" },
];

function useClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toISOString().slice(11, 19) + " UTC"
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function HomePage() {
  const clock = useClock();
  const [frameIndex, setFrameIndex] = useState(0);
  const [revealedLines, setRevealedLines] = useState(0);

  const currentFrame = ASCII_FRAMES[frameIndex];
  const lines = currentFrame.art.split("\n");

  // Typewriter reveal
  useEffect(() => {
    setRevealedLines(0);
    let line = 0;
    const id = setInterval(() => {
      line++;
      setRevealedLines(line);
      if (line >= lines.length) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, [frameIndex, lines.length]);

  // Cycle frames
  useEffect(() => {
    const id = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % ASCII_FRAMES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        window.location.href = "/reference";
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden flex flex-col">
      {/* Blueprint grid — darker variant */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(250,250,248,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(250,250,248,0.03) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
        aria-hidden
      />

      {/* Scanline effect */}
      <div
        className="fixed inset-0 pointer-events-none z-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)",
        }}
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col max-w-3xl mx-auto w-full px-6 py-8">
        {/* Top bar — system status */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            <span className="text-micro text-dark-50">SYS.ONLINE</span>
          </div>
          <span className="text-micro text-dark-50">{clock}</span>
        </div>

        {/* Main content — centered */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* ASCII art display */}
          <div className="relative mb-10 w-full max-w-md">
            <CropMarks size={16} className="!border-dark-50/20" />
            <div className="border border-dark-50/10 p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={frameIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <pre
                    className="text-accent text-center leading-tight select-none"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {lines
                      .slice(0, revealedLines)
                      .join("\n")}
                  </pre>
                  {/* Reserve space for unrevealed lines */}
                  <pre
                    className="invisible"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      height: 0,
                      overflow: "hidden",
                    }}
                    aria-hidden
                  >
                    {lines.join("\n")}
                  </pre>
                </motion.div>
              </AnimatePresence>

              {/* Element label */}
              <div className="text-center mt-4 border-t border-dark-50/10 pt-3">
                <span className="text-micro text-accent-dark">
                  {currentFrame.label}
                </span>
              </div>
            </div>

            {/* Frame indicator dots */}
            <div className="flex justify-center gap-1.5 mt-3">
              {ASCII_FRAMES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFrameIndex(i)}
                  className={`w-1.5 h-1.5 border-none cursor-pointer transition-colors ${
                    i === frameIndex ? "bg-accent" : "bg-dark-50/30"
                  }`}
                  aria-label={`Frame ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="text-display-hero text-white mb-2">HARDWAR</h1>
            <span className="text-display-section text-dark-50 tracking-[0.2em]">
              TACTICAL COMPANION
            </span>
          </div>

          {/* Navigation */}
          <nav className="w-full max-w-xs space-y-2 mb-12">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-4 px-4 py-2.5 no-underline border border-dark-50/20 hover:border-accent transition-colors"
              >
                <span className="text-micro text-dark-50 group-hover:text-accent transition-colors">
                  {link.code}
                </span>
                <span className="text-display-section text-dark-50 group-hover:text-accent transition-colors">
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between pt-4 border-t border-dark-50/10">
          <div className="flex gap-6">
            <span className="text-micro text-dark-50">
              <span className="text-accent-dark">192</span> ELEMENTS
            </span>
            <span className="text-micro text-dark-50">
              <span className="text-accent-dark">13</span> MISSIONS
            </span>
            <span className="text-micro text-dark-50">
              <span className="text-accent-dark">167</span> KEYWORDS
            </span>
          </div>
          <span className="text-micro text-dark-50/40">
            MODIPHIUS // 6MM TACTICAL WARGAME
          </span>
        </div>
      </div>
    </div>
  );
}
