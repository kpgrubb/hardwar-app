"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BRIEFING_MESSAGES } from "./BriefingMessages";
import elementsData from "@/data/elements.json";
import missionsData from "@/data/missions.json";
import keywordsData from "@/data/keywords.json";

function useClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(new Date().toISOString().slice(11, 19));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

const NAV_LINKS = [
  { href: "/learn", label: "Learn the Rules", code: "01", desc: "Structured modules" },
  { href: "/reference", label: "Rules Reference", code: "02", desc: "Elements & missions" },
  { href: "/session", label: "Session Aid", code: "03", desc: "Solo/Co-op engine" },
];

export default function HomePage() {
  const clock = useClock();
  const [history, setHistory] = useState<typeof BRIEFING_MESSAGES>(() => {
    // Pick a random starting message
    const idx = Math.floor(Math.random() * BRIEFING_MESSAGES.length);
    return [BRIEFING_MESSAGES[idx]];
  });
  const [displayedChars, setDisplayedChars] = useState(0);

  const currentMsg = history[0];
  const fullText = `[${currentMsg.prefix}] ${currentMsg.text}`;

  // Typewriter for current message
  useEffect(() => {
    setDisplayedChars(0);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayedChars(i);
      if (i >= fullText.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [currentMsg, fullText.length]);

  // Random message cycling
  useEffect(() => {
    const id = setInterval(() => {
      setHistory((prev) => {
        let next: typeof BRIEFING_MESSAGES[number];
        do {
          next = BRIEFING_MESSAGES[Math.floor(Math.random() * BRIEFING_MESSAGES.length)];
        } while (next === prev[0] && BRIEFING_MESSAGES.length > 1);
        return [next, ...prev.slice(0, 5)];
      });
    }, 6000);
    return () => clearInterval(id);
  }, []);

  // Recent messages (skip current, take next 4)
  const recentMessages = history.slice(1, 5).map((msg) => {
    return msg;
  });

  return (
    <div className="min-h-screen bg-bg-primary relative overflow-hidden">
      {/* Dot matrix background */}
      <div className="fixed inset-0 bg-dot-matrix opacity-40 pointer-events-none z-0" aria-hidden />

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 py-8 min-h-screen flex flex-col">

        {/* Top status bar */}
        <div className="flex items-center justify-between pb-4 border-b border-dark-20 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 bg-accent flex items-center justify-center">
              <span className="text-dark font-bold text-[10px]" style={{ fontFamily: "var(--font-mono)" }}>H</span>
            </div>
            <span className="text-micro text-dark-50">ENGINE CORE OBS</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-micro text-dark-50">OPERATIONAL</span>
            <span className="text-micro text-dark">{clock} UTC</span>
          </div>
        </div>

        {/* Main grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left column — Hero + Nav */}
          <div className="lg:col-span-5 flex flex-col">
            {/* Callsign block */}
            <div className="mb-8">
              <span className="text-micro text-dark-50 block mb-2">DEPLOYMENT TERMINAL</span>
              <h1
                className="text-dark m-0 leading-none"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(56px, 10vw, 96px)",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                HARD
                <br />
                WAR
              </h1>
            </div>

            {/* Subtitle row */}
            <div className="flex items-center gap-4 mb-8 pb-4 border-b border-dark-20">
              <span className="text-display-section text-dark">Tactical Companion</span>
              <div className="flex-1 border-t border-dark-20" aria-hidden />
              <span className="text-micro text-dark-50">v1.0</span>
            </div>

            {/* Nav links */}
            <nav className="space-y-2 mb-8">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                >
                  <Link
                    href={link.href}
                    className="group flex items-center gap-4 px-4 py-3 no-underline border border-dark-20 hover:border-accent bg-bg-card hover:bg-accent-glow transition-all duration-200"
                  >
                    <span
                      className="w-8 h-8 bg-dark flex items-center justify-center shrink-0 group-hover:bg-accent transition-colors duration-200"
                    >
                      <span className="text-micro text-white group-hover:text-dark transition-colors duration-200">
                        {link.code}
                      </span>
                    </span>
                    <div>
                      <span className="text-display-section text-dark block">
                        {link.label}
                      </span>
                      <span className="text-micro text-dark-50">{link.desc}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Stats row */}
            <div className="flex gap-6 mt-auto">
              {[
                { value: String(elementsData.length), label: "ELEMENTS" },
                { value: String(missionsData.length), label: "MISSIONS" },
                { value: String(keywordsData.length), label: "KEYWORDS" },
              ].map((stat) => (
                <div key={stat.label}>
                  <span
                    className="text-dark block leading-none mb-0.5"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "32px",
                      fontWeight: 700,
                    }}
                  >
                    {stat.value}
                  </span>
                  <span className="text-micro text-dark-50">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — Terminal feed */}
          <div className="lg:col-span-7">
            {/* Terminal panel */}
            <div className="relative border border-dark-20 bg-bg-card h-full flex flex-col">
              {/* Corner marks */}
              <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-dark-50/40" aria-hidden />
              <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-dark-50/40" aria-hidden />
              <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-dark-50/40" aria-hidden />
              <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-dark-50/40" aria-hidden />

              {/* Terminal header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-dark-20">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                  <span className="text-micro text-dark-50">TACTICAL FEED</span>
                </div>
                <span className="text-micro text-dark-50">FREQ 7 // ENCRYPTED</span>
              </div>

              {/* Active message — large display */}
              <div className="px-5 py-6 border-b border-dark-20">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-micro px-1.5 py-0.5 ${
                    currentMsg.priority === "alert"
                      ? "bg-accent text-dark"
                      : currentMsg.priority === "intel"
                      ? "bg-dark text-white"
                      : "bg-dark-20 text-dark"
                  }`}>
                    {currentMsg.prefix}
                  </span>
                  <span className="text-micro text-dark-50">{clock}</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentMsg.text}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-body text-dark m-0 leading-relaxed min-h-[3.2em]"
                    style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}
                  >
                    {fullText.slice(0, displayedChars)}
                    {displayedChars < fullText.length && (
                      <span className="inline-block w-1.5 h-3.5 bg-accent ml-0.5 animate-pulse" />
                    )}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Message feed — recent history */}
              <div className="flex-1 px-5 py-4 space-y-3 overflow-hidden">
                <span className="text-micro text-dark-50 block mb-2">RECENT TRAFFIC</span>
                {recentMessages.map((msg, i) => (
                  <motion.div
                    key={`${currentMsg.text}-${i}`}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1 - i * 0.2, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className="flex gap-3 items-start"
                  >
                    <span className="text-micro text-dark-50 shrink-0 w-12">
                      {msg.prefix}
                    </span>
                    <p
                      className="text-dark-50 m-0 line-clamp-1"
                      style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}
                    >
                      {msg.text}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Terminal footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-dark-20">
                <div className="flex items-center gap-2">
                  <span className="text-micro text-dark-50">AO STATUS:</span>
                  <span className="text-micro text-accent-dark">CONTESTED</span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-3 ${i < 3 ? "bg-accent" : "bg-dark-20"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-dark-20">
          <span className="text-micro text-dark-50">
            MODIPHIUS ENTERTAINMENT // STRATO MINIS STUDIO
          </span>
          <div className="flex items-center gap-4">
            <span className="text-micro text-dark-50">6MM TACTICAL WARGAME</span>
            <div className="w-4 h-4 bg-accent flex items-center justify-center">
              <span className="text-dark text-[8px] font-bold" style={{ fontFamily: "var(--font-mono)" }}>X</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
