"use client";

import { useState, useMemo, useEffect } from 'react';
import type { ElementStatCard as ElementType } from '@/types';
import ElementStatCard from './ElementStatCard';

interface ElementBrowserProps {
  elements: ElementType[];
}

// localStorage key for favorites
const FAVORITES_KEY = 'hardwar-favorites';

function loadFavorites(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

export default function ElementBrowser({ elements }: ElementBrowserProps) {
  const [classFilter, setClassFilter] = useState<number | null>(null);
  const [motiveFilter, setMotiveFilter] = useState('');
  const [factionFilter, setFactionFilter] = useState('');
  const [abilityFilter, setAbilityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load favorites from localStorage on mount
  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  const saveFavorites = (newFavs: Set<string>) => {
    setFavorites(newFavs);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...newFavs]));
  };

  const toggleFavorite = (id: string) => {
    const next = new Set(favorites);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    saveFavorites(next);
  };

  const motiveTypes = useMemo(
    () => [...new Set(elements.map((e) => e.motive_type))].sort(),
    [elements]
  );
  const factions = useMemo(
    () => [...new Set(elements.map((e) => e.faction).filter(Boolean))].sort(),
    [elements]
  );

  // Collect all unique abilities across elements
  const allAbilities = useMemo(() => {
    const abilities = new Set<string>();
    for (const el of elements) {
      for (const r of el.special_rules) abilities.add(r);
      for (const w of el.weapon_upgrades) abilities.add(w.name);
      for (const p of el.performance_upgrades) abilities.add(p);
    }
    return [...abilities].sort();
  }, [elements]);

  const filtered = useMemo(() => {
    return elements.filter((e) => {
      if (showFavoritesOnly && !favorites.has(e.id)) return false;
      if (classFilter !== null && e.class !== classFilter) return false;
      if (motiveFilter && e.motive_type !== motiveFilter) return false;
      if (factionFilter && e.faction !== factionFilter) return false;
      if (abilityFilter) {
        const hasAbility =
          e.special_rules.includes(abilityFilter) ||
          e.weapon_upgrades.some((w) => w.name === abilityFilter) ||
          e.performance_upgrades.includes(abilityFilter);
        if (!hasAbility) return false;
      }
      if (searchTerm) {
        const searchable = [
          e.name,
          e.faction,
          e.motive_type,
          ...e.special_rules,
          ...e.weapon_upgrades.map((w) => w.name),
          ...e.performance_upgrades,
        ].join(' ').toLowerCase();
        if (!searchable.includes(searchTerm.toLowerCase())) return false;
      }
      return true;
    });
  }, [elements, classFilter, motiveFilter, factionFilter, abilityFilter, searchTerm, showFavoritesOnly, favorites]);

  return (
    <div>
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 items-center mb-4 pb-4 border-b border-dark-20">
        <input
          type="text"
          placeholder="Search name, rules, weapons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-body bg-surface border border-dark-20 px-4 py-2 text-dark placeholder:text-dark-50 focus:outline-none focus:border-accent transition-colors min-w-[200px]"
        />

        <div className="flex gap-1">
          {[null, 1, 2, 3, 4].map((c) => (
            <button
              key={c ?? 'all'}
              onClick={() => setClassFilter(c)}
              className={`text-meta px-3 py-1.5 border cursor-pointer transition-colors ${
                classFilter === c
                  ? 'bg-accent text-dark border-accent'
                  : 'bg-transparent text-dark-50 border-dark-20 hover:text-dark hover:border-dark-50'
              }`}
            >
              {c === null ? 'ALL' : `C${c}`}
            </button>
          ))}
        </div>

        <select
          value={motiveFilter}
          onChange={(e) => setMotiveFilter(e.target.value)}
          className="text-body bg-surface border border-dark-20 px-3 py-2 text-dark focus:outline-none focus:border-accent transition-colors"
        >
          <option value="">All Motive Types</option>
          {motiveTypes.map((mt) => (
            <option key={mt} value={mt}>{mt}</option>
          ))}
        </select>

        <select
          value={factionFilter}
          onChange={(e) => setFactionFilter(e.target.value)}
          className="text-body bg-surface border border-dark-20 px-3 py-2 text-dark focus:outline-none focus:border-accent transition-colors"
        >
          <option value="">All Factions</option>
          {factions.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      {/* Second filter row: abilities + favorites */}
      <div className="flex flex-wrap gap-3 items-center mb-6 pb-4 border-b border-dark-20">
        <select
          value={abilityFilter}
          onChange={(e) => setAbilityFilter(e.target.value)}
          className="text-body bg-surface border border-dark-20 px-3 py-2 text-dark focus:outline-none focus:border-accent transition-colors"
        >
          <option value="">All Abilities</option>
          {allAbilities.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`text-meta px-3 py-1.5 border cursor-pointer transition-colors ${
            showFavoritesOnly
              ? 'bg-accent text-dark border-accent'
              : 'bg-transparent text-dark-50 border-dark-20 hover:border-dark-50'
          }`}
        >
          FAVORITES {favorites.size > 0 ? `(${favorites.size})` : ''}
        </button>

        <span className="text-micro text-dark-50 ml-auto">
          {filtered.length} / {elements.length} ELEMENTS
        </span>
      </div>

      {/* Element Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 auto-rows-fr">
        {filtered.map((element, i) => (
          <div key={element.id} className="relative">
            <ElementStatCard element={element} index={i} />
            {/* Favorite star */}
            <button
              onClick={(e) => { e.stopPropagation(); toggleFavorite(element.id); }}
              className={`absolute top-11 right-12 z-10 w-6 h-6 flex items-center justify-center border-none cursor-pointer transition-colors ${
                favorites.has(element.id)
                  ? 'bg-accent text-dark'
                  : 'bg-dark/50 text-dark-50 hover:text-white'
              }`}
              aria-label={favorites.has(element.id) ? 'Remove from favorites' : 'Add to favorites'}
            >
              <span style={{ fontSize: '12px' }}>{favorites.has(element.id) ? '★' : '☆'}</span>
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-body text-dark-50">No elements match the current filters.</p>
        </div>
      )}
    </div>
  );
}
