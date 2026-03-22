"use client";

import { motion } from "framer-motion";
import Panel from "@/components/shared/Panel";

const COMPARISONS = [
  {
    topic: "Initiative",
    core: "Secret bid of Action Tokens. Highest bid wins. Bid tokens removed from elements.",
    quickplay: "Player with fewer total Action Tokens wins. No bidding. Ties: fewer C in play, then D12.",
    page_core: 36,
    page_qp: 185,
  },
  {
    topic: "Damage Bar",
    core: "Equals the element's Armour (A) stat. Each hit fills one box.",
    quickplay: "Fixed at 2x the element's Class value (C1=2, C2=4, C3=6, C4=8).",
    page_core: 27,
    page_qp: 185,
  },
  {
    topic: "Critical Hits",
    core: "Twin pair in attack pool = attacker chooses which stat to reduce instead of defender.",
    quickplay: "Each twin pair in a group causes +1 additional damage point (stacks per pair).",
    page_core: 41,
    page_qp: 185,
  },
  {
    topic: "Electronic Warfare",
    core: "Full frequency system (1-6 vs 7-12). Allocate Interference Tokens to defend own frequency and jam opponent's.",
    quickplay: "Simplified dice pool. When calling Reserves/Assets, both sides build secret pools from tokens. Roll and compare.",
    page_core: 38,
    page_qp: 185,
  },
  {
    topic: "Aimed Shot",
    core: "Costs 2 Action Tokens. +1F to the attack. Enemy may react before shot resolves.",
    quickplay: "+2F instead of +1F. Otherwise same.",
    page_core: 42,
    page_qp: 185,
  },
  {
    topic: "Relay Coordinates",
    core: "Costs 1 Action Token to mark a target in LoS for Indirect Fire elements.",
    quickplay: "Free — no Action Token cost.",
    page_core: 43,
    page_qp: 185,
  },
  {
    topic: "Duck & Move",
    core: "Available to Walkers. Move at Cautious speed with reduced silhouette. LoS checked to pelvis height.",
    quickplay: "Not available. Walkers cannot use Duck & Move.",
    page_core: 40,
    page_qp: 185,
  },
  {
    topic: "Aircraft Altitude",
    core: "Full elevation system. Aircraft operate in Low Altitude Zone (0-12\" above tallest terrain). Track height changes.",
    quickplay: "All Aircraft at fixed 6\" height unless landed. No elevation tracking.",
    page_core: 59,
    page_qp: 186,
  },
  {
    topic: "Ambush",
    core: "Purchased as Tactical Asset (3 BP). Up to 3 elements placed after opponent deploys.",
    quickplay: "Requires winning Initiative (not purchasing). Otherwise same.",
    page_core: 128,
    page_qp: 186,
  },
  {
    topic: "Network Assets",
    core: "Available anytime with Command Token and successful EW.",
    quickplay: "Conditional triggers — some require winning Initiative.",
    page_core: 129,
    page_qp: 186,
  },
];

export default function QuickplayComparison() {
  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="text-micro text-dark-50 block mb-1">REFERENCE</span>
          <h2 className="text-display-title text-dark m-0">Core vs Quickplay</h2>
        </div>
        <span className="text-micro text-dark-50">{COMPARISONS.length} DIFFERENCES</span>
      </div>

      <div className="space-y-3">
        {COMPARISONS.map((comp, i) => (
          <motion.div
            key={comp.topic}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Panel statusTape="accent" className="!p-0 overflow-hidden">
              {/* Topic header */}
              <div className="px-5 py-2.5 border-b border-dark-20 bg-surface">
                <span className="text-display-section text-dark">{comp.topic}</span>
              </div>

              {/* Side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="px-5 py-3 md:border-r border-dark-20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-micro bg-dark text-white px-1.5 py-0.5">CORE</span>
                    <span className="text-micro text-dark-50">p.{comp.page_core}</span>
                  </div>
                  <p className="text-body-sm text-dark m-0">{comp.core}</p>
                </div>
                <div className="px-5 py-3 border-t md:border-t-0 border-dark-20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-micro bg-accent text-dark px-1.5 py-0.5">QUICKPLAY</span>
                    <span className="text-micro text-dark-50">p.{comp.page_qp}</span>
                  </div>
                  <p className="text-body-sm text-dark m-0">{comp.quickplay}</p>
                </div>
              </div>
            </Panel>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
