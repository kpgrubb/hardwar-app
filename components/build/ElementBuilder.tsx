"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import Panel from "@/components/shared/Panel";
import CropMarks from "@/components/shared/CropMarks";
import StatCell from "@/components/shared/StatCell";
import {
  ELEMENT_TYPES,
  MOTIVE_TYPES,
  WEAPON_UPGRADES,
  PERFORMANCE_UPGRADES,
  SPECIAL_SKILLS,
  FLAWS,
  getBaseCP,
  getMaxClass,
  calculateCP,
  validate,
  type ElementType,
  type CustomElement,
} from "@/lib/engine/construction";

const SAVED_KEY = "hardwar-custom-elements";

function loadSaved(): CustomElement[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(SAVED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function newElement(): CustomElement {
  return {
    name: "",
    type: "Walker",
    classLevel: 2,
    motiveType: "Walker",
    stats: { M: 3, F: 3, D: 2, A: 2 },
    weaponUpgrades: [],
    performanceUpgrades: [],
    specialSkills: [],
    flaws: [],
    isExperimental: false,
  };
}

type UpgradeTab = "weapons" | "performance" | "skills" | "flaws";

export default function ElementBuilder() {
  const [element, setElement] = useState<CustomElement>(newElement());
  const [saved, setSaved] = useState<CustomElement[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [upgradeTab, setUpgradeTab] = useState<UpgradeTab>("weapons");

  useEffect(() => { setSaved(loadSaved()); }, []);

  const cp = useMemo(() => calculateCP(element), [element]);
  const errors = useMemo(() => validate(element), [element]);

  const update = (patch: Partial<CustomElement>) => {
    setElement((prev) => {
      const next = { ...prev, ...patch };
      // Auto-set motive type when type changes
      if (patch.type && patch.type !== prev.type) {
        next.motiveType = MOTIVE_TYPES[patch.type][0];
        if (patch.type === "Defence") next.stats = { ...next.stats, M: 0 };
      }
      return next;
    });
  };

  const updateStat = (stat: "M" | "F" | "D" | "A", delta: number) => {
    setElement((prev) => ({
      ...prev,
      stats: { ...prev.stats, [stat]: Math.max(0, prev.stats[stat] + delta) },
    }));
  };

  const toggleUpgrade = (list: "weaponUpgrades" | "performanceUpgrades" | "specialSkills" | "flaws", id: string) => {
    setElement((prev) => {
      const current = prev[list];
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      return { ...prev, [list]: next };
    });
  };

  const handleSave = () => {
    if (errors.length > 0) return;
    const next = editingIndex !== null
      ? saved.map((s, i) => (i === editingIndex ? element : s))
      : [...saved, element];
    setSaved(next);
    localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    setElement(newElement());
    setEditingIndex(null);
  };

  const handleEdit = (idx: number) => {
    setElement(saved[idx]);
    setEditingIndex(idx);
  };

  const handleDelete = (idx: number) => {
    const next = saved.filter((_, i) => i !== idx);
    setSaved(next);
    localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    if (editingIndex === idx) {
      setElement(newElement());
      setEditingIndex(null);
    }
  };

  const handleNew = () => {
    setElement(newElement());
    setEditingIndex(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="text-micro text-dark-50 block mb-1">CORE &gt; BUILD</span>
          <h1 className="text-display-title text-dark m-0">Element Construction</h1>
        </div>
        <span className="text-micro text-dark-50">PP.169-174</span>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Builder panel */}
        <div className="flex-1 min-w-0">
          <Panel statusTape="accent">
            {/* Name + Type + Class */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-micro text-dark-50 block mb-1">ELEMENT NAME</label>
                <input
                  type="text"
                  value={element.name}
                  onChange={(e) => update({ name: e.target.value })}
                  placeholder="Name your element..."
                  className="w-full text-body bg-surface border border-dark-20 px-4 py-2 text-dark placeholder:text-dark-50 focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="text-micro text-dark-50 block mb-1">TYPE</label>
                <select
                  value={element.type}
                  onChange={(e) => update({ type: e.target.value as ElementType })}
                  className="w-full text-body bg-surface border border-dark-20 px-3 py-2 text-dark focus:outline-none focus:border-accent"
                >
                  {ELEMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-micro text-dark-50 block mb-1">CLASS</label>
                <div className="flex gap-1">
                  {Array.from({ length: getMaxClass(element.type) }, (_, i) => i + 1).map((c) => (
                    <button
                      key={c}
                      onClick={() => update({ classLevel: c })}
                      className={`flex-1 text-meta py-2 border cursor-pointer transition-colors ${
                        element.classLevel === c
                          ? "bg-accent text-dark border-accent"
                          : "bg-transparent text-dark-50 border-dark-20 hover:border-dark-50"
                      }`}
                    >
                      C{c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Motive Type + Experimental */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <label className="text-micro text-dark-50 block mb-1">MOTIVE TYPE</label>
                <select
                  value={element.motiveType}
                  onChange={(e) => update({ motiveType: e.target.value })}
                  className="w-full text-body bg-surface border border-dark-20 px-3 py-2 text-dark focus:outline-none focus:border-accent"
                >
                  {MOTIVE_TYPES[element.type].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    const next = !element.isExperimental;
                    const flaws = next
                      ? [...new Set([...element.flaws, "design-flaw", "incompatible-standard"])]
                      : element.flaws.filter((f) => f !== "design-flaw" && f !== "incompatible-standard");
                    update({ isExperimental: next, flaws });
                  }}
                  disabled={element.type === "Trooper"}
                  className={`text-meta px-4 py-2 border cursor-pointer transition-colors ${
                    element.isExperimental
                      ? "bg-accent text-dark border-accent"
                      : "bg-transparent text-dark-50 border-dark-20 hover:border-dark-50"
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  EXPERIMENTAL {element.isExperimental ? "(+2 CP)" : ""}
                </button>
              </div>
            </div>

            {/* CP Budget bar */}
            <div className="bg-surface border border-dark-20 p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-display-section text-dark">CONSTRUCTION POINTS</span>
                <span className={`text-display-card ${cp.remainingCP >= 0 ? "text-dark" : "text-red-muted"}`}>
                  {cp.remainingCP} CP REMAINING
                </span>
              </div>
              <div className="w-full h-2 bg-dark-20 mb-3">
                <div
                  className={`h-full transition-all ${cp.remainingCP >= 0 ? "bg-accent" : "bg-red-muted"}`}
                  style={{ width: `${Math.min(100, (cp.spentCP / cp.totalCP) * 100)}%` }}
                />
              </div>
              <div className="flex gap-4 text-micro text-dark-50">
                <span>TOTAL: <span className="text-dark">{cp.totalCP}</span></span>
                <span>SPENT: <span className="text-dark">{cp.spentCP}</span></span>
                {cp.breakdown.map((b, i) => (
                  <span key={i}>{b.label}: <span className="text-dark">{b.cost > 0 ? b.cost : b.cost}</span></span>
                ))}
              </div>
            </div>

            {/* Stats allocation */}
            <div className="mb-6">
              <span className="text-display-section text-dark-50 block mb-3">STAT ALLOCATION</span>
              <div className="grid grid-cols-4 gap-3">
                {(["M", "F", "D", "A"] as const).map((stat) => (
                  <div key={stat} className="text-center">
                    <StatCell label={stat.toLowerCase()} value={element.stats[stat]} />
                    <div className="flex gap-1 mt-2 justify-center">
                      <button
                        onClick={() => updateStat(stat, -1)}
                        disabled={element.stats[stat] <= (element.type === "Defence" && stat === "M" ? 0 : 0)}
                        className="w-8 h-8 text-meta bg-transparent border border-dark-20 hover:border-dark-50 cursor-pointer transition-colors disabled:opacity-20"
                      >
                        −
                      </button>
                      <button
                        onClick={() => updateStat(stat, 1)}
                        disabled={cp.remainingCP <= 0}
                        className="w-8 h-8 text-meta bg-transparent border border-dark-20 hover:border-dark-50 cursor-pointer transition-colors disabled:opacity-20"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrades + Flaws tabs */}
            <div className="mb-6">
              <div className="flex gap-1 mb-4 border-b border-dark-20 pb-2">
                {([
                  { id: "weapons" as UpgradeTab, label: "Weapons", count: element.weaponUpgrades.length },
                  { id: "performance" as UpgradeTab, label: "Performance", count: element.performanceUpgrades.length },
                  { id: "skills" as UpgradeTab, label: "Skills", count: element.specialSkills.length },
                  { id: "flaws" as UpgradeTab, label: "Flaws", count: element.flaws.length },
                ]).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setUpgradeTab(tab.id)}
                    className={`text-meta px-3 py-1.5 border-none cursor-pointer transition-colors ${
                      upgradeTab === tab.id ? "bg-accent text-dark" : "bg-transparent text-dark-50 hover:text-dark"
                    }`}
                  >
                    {tab.label} {tab.count > 0 ? `(${tab.count})` : ""}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[300px] overflow-y-auto">
                {upgradeTab === "weapons" && WEAPON_UPGRADES.map((u) => {
                  const selected = element.weaponUpgrades.includes(u.id);
                  return (
                    <button key={u.id} onClick={() => toggleUpgrade("weaponUpgrades", u.id)}
                      className={`text-left px-3 py-2 border cursor-pointer transition-colors ${
                        selected ? "bg-accent/20 border-accent" : "bg-transparent border-dark-20 hover:border-dark-50"
                      }`}>
                      <span className="text-display-section text-dark block">{u.name}</span>
                      <span className="text-micro text-dark-50">{u.desc}</span>
                    </button>
                  );
                })}
                {upgradeTab === "performance" && PERFORMANCE_UPGRADES.map((u) => {
                  const selected = element.performanceUpgrades.includes(u.id);
                  return (
                    <button key={u.id} onClick={() => toggleUpgrade("performanceUpgrades", u.id)}
                      className={`text-left px-3 py-2 border cursor-pointer transition-colors ${
                        selected ? "bg-accent/20 border-accent" : "bg-transparent border-dark-20 hover:border-dark-50"
                      }`}>
                      <span className="text-display-section text-dark block">{u.name}</span>
                      <span className="text-micro text-dark-50">{u.desc}</span>
                    </button>
                  );
                })}
                {upgradeTab === "skills" && SPECIAL_SKILLS.map((u) => {
                  const selected = element.specialSkills.includes(u.id);
                  return (
                    <button key={u.id} onClick={() => toggleUpgrade("specialSkills", u.id)}
                      className={`text-left px-3 py-2 border cursor-pointer transition-colors ${
                        selected ? "bg-accent/20 border-accent" : "bg-transparent border-dark-20 hover:border-dark-50"
                      }`}>
                      <span className="text-display-section text-dark block">{u.name}</span>
                      <span className="text-micro text-dark-50">{u.desc}</span>
                    </button>
                  );
                })}
                {upgradeTab === "flaws" && FLAWS.map((u) => {
                  const selected = element.flaws.includes(u.id);
                  const locked = element.isExperimental && (u.id === "design-flaw" || u.id === "incompatible-standard");
                  return (
                    <button key={u.id} onClick={() => !locked && toggleUpgrade("flaws", u.id)}
                      disabled={locked}
                      className={`text-left px-3 py-2 border cursor-pointer transition-colors ${
                        selected ? "bg-red-muted/15 border-red-muted/40" : "bg-transparent border-dark-20 hover:border-dark-50"
                      } disabled:opacity-50`}>
                      <span className="text-display-section text-dark block">{u.name} <span className="text-accent-dark">+1 CP</span></span>
                      <span className="text-micro text-dark-50">{u.desc}</span>
                      {locked && <span className="text-micro text-red-muted block mt-0.5">LOCKED (Experimental)</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Validation errors */}
            {errors.length > 0 && (
              <div className="bg-red-muted/10 border border-red-muted/40 p-3 mb-4">
                {errors.map((e, i) => (
                  <div key={i} className="text-body-sm text-red-muted">{e.message}</div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={errors.length > 0 || !element.name.trim()}
                className="text-display-section bg-accent text-dark px-6 py-2.5 border-none cursor-pointer hover:bg-accent-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {editingIndex !== null ? "UPDATE ELEMENT" : "SAVE ELEMENT"}
              </button>
              {editingIndex !== null && (
                <button onClick={handleNew}
                  className="text-meta text-dark-50 border border-dark-20 hover:border-dark-50 px-4 py-2 bg-transparent cursor-pointer transition-colors">
                  CANCEL
                </button>
              )}
            </div>
          </Panel>
        </div>

        {/* Saved elements sidebar */}
        <div className="xl:w-[320px] xl:shrink-0">
          <Panel className="!p-0 overflow-hidden">
            <div className="bg-dark px-4 py-2.5 flex items-center justify-between">
              <span className="text-display-section text-white">SAVED ELEMENTS</span>
              <span className="text-micro text-dark-50">{saved.length}</span>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {saved.length === 0 ? (
                <div className="p-4 text-center">
                  <span className="text-body-sm text-dark-50">No custom elements yet.</span>
                </div>
              ) : (
                saved.map((el, i) => (
                  <div key={i} className="border-b border-dark-20 p-3 relative">
                    <CropMarks size={6} />
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-display-section text-dark">{el.name}</span>
                      <span className="text-micro text-accent-dark">C{el.classLevel}</span>
                    </div>
                    <span className="text-micro text-dark-50 block mb-2">
                      {el.type} / {el.motiveType} / M{el.stats.M} F{el.stats.F} D{el.stats.D} A{el.stats.A}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(i)}
                        className="text-micro text-dark-50 border border-dark-20 hover:border-dark-50 px-2 py-0.5 bg-transparent cursor-pointer transition-colors">
                        EDIT
                      </button>
                      <button onClick={() => handleDelete(i)}
                        className="text-micro text-red-muted border border-red-muted/30 hover:border-red-muted px-2 py-0.5 bg-transparent cursor-pointer transition-colors">
                        DELETE
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>
      </div>
    </motion.div>
  );
}
