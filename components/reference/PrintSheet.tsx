"use client";

import { useState, useMemo } from 'react';
import type { ElementStatCard as ElementType, KeywordDefinition } from '@/types';
import ElementStatCard from './ElementStatCard';
import keywordsData from '@/data/keywords.json';

const allKeywords = keywordsData as KeywordDefinition[];

// Build lookup: lowercased term/alias -> keyword
const keywordMap = new Map<string, KeywordDefinition>();
for (const kw of allKeywords) {
  keywordMap.set(kw.term.toLowerCase(), kw);
  for (const alias of kw.aliases) {
    keywordMap.set(alias.toLowerCase(), kw);
  }
}

function getKeywordsForElements(elements: ElementType[]): KeywordDefinition[] {
  const found = new Map<string, KeywordDefinition>();
  for (const el of elements) {
    // Check special rules, weapon upgrades, performance upgrades, motive type
    const terms = [
      ...el.special_rules,
      ...el.weapon_upgrades.map((w) => w.name),
      ...el.performance_upgrades,
      el.motive_type,
    ];
    for (const term of terms) {
      const kw = keywordMap.get(term.toLowerCase());
      if (kw && !found.has(kw.term)) {
        found.set(kw.term, kw);
      }
    }
  }
  return [...found.values()].sort((a, b) => a.term.localeCompare(b.term));
}

interface PrintSheetProps {
  elements: ElementType[];
}

export default function PrintSheet({ elements }: PrintSheetProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleElement = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(elements.map((e) => e.id)));
  const selectNone = () => setSelected(new Set());

  const printElements = elements.filter((e) => selected.has(e.id));

  // 2x3 grid = 6 cards per page
  const cardPages: ElementType[][] = [];
  for (let i = 0; i < printElements.length; i += 6) {
    cardPages.push(printElements.slice(i, i + 6));
  }

  // Collect all keywords used across selected elements
  const glossaryKeywords = useMemo(
    () => getKeywordsForElements(printElements),
    [printElements]
  );

  // Chunk glossary into pages (~20 definitions per page)
  const glossaryPages: KeywordDefinition[][] = [];
  for (let i = 0; i < glossaryKeywords.length; i += 20) {
    glossaryPages.push(glossaryKeywords.slice(i, i + 20));
  }

  return (
    <div>
      {/* Selection controls — hidden in print */}
      <div className="no-print mb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => window.print()}
            disabled={selected.size === 0}
            className="text-display-section bg-accent text-dark px-6 py-2.5 border-none cursor-pointer hover:bg-accent-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            PRINT {selected.size} CARD{selected.size !== 1 ? 'S' : ''}
          </button>
          <button
            onClick={selectAll}
            className="text-meta text-dark border border-dark-20 hover:border-dark-50 px-3 py-2 bg-transparent cursor-pointer transition-colors"
          >
            SELECT ALL
          </button>
          <button
            onClick={selectNone}
            className="text-meta text-dark-50 border border-dark-20 hover:border-dark-50 px-3 py-2 bg-transparent cursor-pointer transition-colors"
          >
            CLEAR
          </button>
          <span className="text-micro text-dark-50 ml-auto">
            {selected.size} CARDS — {cardPages.length} CARD PAGE{cardPages.length !== 1 ? 'S' : ''}
            {glossaryPages.length > 0 && ` + ${glossaryPages.length} GLOSSARY PAGE${glossaryPages.length !== 1 ? 'S' : ''}`}
          </span>
        </div>

        {/* Clickable element grid for selection */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-1.5">
          {elements.map((el) => {
            const isSelected = selected.has(el.id);
            return (
              <button
                key={el.id}
                onClick={() => toggleElement(el.id)}
                className={`text-left px-2 py-1.5 border cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-accent/20 border-accent text-dark'
                    : 'bg-transparent border-dark-20 text-dark-50 hover:border-dark-50'
                }`}
              >
                <span className="text-micro block">{el.name}</span>
                <span className="text-micro text-dark-50">C{el.class} {el.motive_type}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Print card pages — 2x3 grid */}
      {cardPages.map((page, pageIdx) => (
        <div
          key={`cards-${pageIdx}`}
          className="stat-card"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 3.5in)',
            gridTemplateRows: 'repeat(3, 3in)',
            gap: '0.25in',
            pageBreakAfter: 'always',
            width: '7.5in',
            margin: '0 auto',
            padding: '0.25in 0',
          }}
        >
          {page.map((element) => (
            <div
              key={element.id}
              style={{
                width: '3.5in',
                height: '3in',
                overflow: 'hidden',
                border: '0.5px solid #ccc',
              }}
            >
              <ElementStatCard element={element} compact />
            </div>
          ))}
        </div>
      ))}

      {/* Keyword glossary pages */}
      {glossaryPages.map((page, pageIdx) => (
        <div
          key={`glossary-${pageIdx}`}
          className="stat-card"
          style={{
            pageBreakAfter: 'always',
            width: '7.5in',
            margin: '0 auto',
            padding: '0.25in 0',
          }}
        >
          {/* Glossary header */}
          <div
            style={{
              borderBottom: '2px solid #1C1814',
              paddingBottom: '6px',
              marginBottom: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#1C1814',
              }}
            >
              Keyword Reference
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '8px',
                color: '#8E8C8A',
                textTransform: 'uppercase',
              }}
            >
              Page {pageIdx + 1} of {glossaryPages.length}
            </span>
          </div>

          {/* Two-column glossary */}
          <div
            style={{
              columnCount: 2,
              columnGap: '0.3in',
              fontSize: '8pt',
              lineHeight: 1.4,
            }}
          >
            {page.map((kw) => (
              <div
                key={kw.term}
                style={{
                  breakInside: 'avoid',
                  marginBottom: '8px',
                  paddingBottom: '6px',
                  borderBottom: '0.5px solid #D5D4D3',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '8px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#1C1814',
                    display: 'block',
                    marginBottom: '2px',
                  }}
                >
                  {kw.term}
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '7px',
                      color: '#8E8C8A',
                      marginLeft: '6px',
                      fontWeight: 400,
                    }}
                  >
                    p.{kw.page_ref_core}
                  </span>
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '8px',
                    color: '#4A4644',
                    display: 'block',
                  }}
                >
                  {kw.definition_core}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
