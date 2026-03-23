"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRulesetStore } from '@/stores/rulesetStore';
import SearchPanel from '@/components/reference/SearchPanel';

const NAV_ITEMS = [
  { href: '/learn', label: 'Learn', code: 'LRN' },
  { href: '/reference', label: 'Reference', code: 'REF' },
  { href: '/lore', label: 'Lore', code: 'LOR' },
  { href: '/session', label: 'Session', code: 'SES' },
];

export default function Header() {
  const { ruleset, setRuleset } = useRulesetStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !searchOpen)) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchOpen]);

  return (
    <>
      <header className="relative z-20 bg-dark border-b border-dark-50/20 no-print">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-8 flex items-center h-12">
          {/* Brand */}
          <Link href="/" className="no-underline flex items-center gap-3 mr-8">
            <span className="text-display-card text-white tracking-widest">
              HARDWAR
            </span>
            <span className="text-micro text-dark-50">COMPANION</span>
          </Link>

          {/* Separator */}
          <div className="w-px h-5 bg-dark-50/30 mr-6" aria-hidden />

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 no-underline transition-colors ${
                    isActive
                      ? 'bg-accent text-dark'
                      : 'text-dark-50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-micro">{item.code}</span>
                  <span className="text-display-section hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="text-meta text-dark-50 hover:text-white bg-transparent border border-dark-50/30 px-3 py-1 cursor-pointer transition-colors"
            >
              Search <span className="text-dark-50/40 ml-1">^K</span>
            </button>

            <div className="w-px h-5 bg-dark-50/30" aria-hidden />

            <button
              onClick={() => setRuleset(ruleset === 'core' ? 'quickplay' : 'core')}
              className="text-meta font-bold bg-transparent border border-accent/60 text-accent px-3 py-1 cursor-pointer hover:bg-accent hover:text-dark transition-colors"
            >
              {ruleset.toUpperCase()}
            </button>

          </div>
        </div>
      </header>
      {searchOpen && <SearchPanel onClose={() => setSearchOpen(false)} />}
    </>
  );
}
