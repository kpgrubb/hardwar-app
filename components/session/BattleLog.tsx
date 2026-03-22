"use client";

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Panel from '@/components/shared/Panel';
import { useSessionStore } from '@/stores/sessionStore';

const TYPE_COLORS: Record<string, string> = {
  system: 'text-dark-50',
  spawn: 'text-accent-dark',
  combat: 'text-red-muted',
  user: 'text-dark',
};

type FilterType = 'all' | 'system' | 'spawn' | 'combat' | 'user';

export default function BattleLog() {
  const { log, addLog } = useSessionStore();
  const endRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log.length]);

  const handleAddNote = () => {
    const note = prompt('Add a note to the battle log:');
    if (note?.trim()) {
      addLog(note.trim(), 'user');
    }
  };

  const handleExport = () => {
    const lines = log.map(
      (e) => `[T${e.turn}] [${e.type.toUpperCase()}] ${e.message}`
    );
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hardwar-battle-log-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLog = filter === 'all' ? log : log.filter((e) => e.type === filter);

  // Track turns for separators
  let lastTurn = -1;

  return (
    <Panel className="flex flex-col !p-0 overflow-hidden">
      <div className="bg-dark px-4 py-2 flex items-center justify-between">
        <span className="text-display-section text-white">Battle Log</span>
        <div className="flex gap-1">
          <button
            onClick={handleAddNote}
            className="text-micro text-dark-50 hover:text-white bg-transparent border border-dark-50/30 px-2 py-0.5 cursor-pointer transition-colors"
          >
            + NOTE
          </button>
          <button
            onClick={handleExport}
            disabled={log.length === 0}
            className="text-micro text-dark-50 hover:text-white bg-transparent border border-dark-50/30 px-2 py-0.5 cursor-pointer transition-colors disabled:opacity-30"
          >
            EXPORT
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex gap-1 px-3 py-2 border-b border-dark-20">
        {(['all', 'system', 'spawn', 'combat', 'user'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-micro px-2 py-0.5 border cursor-pointer transition-colors ${
              filter === f
                ? 'bg-accent text-dark border-accent'
                : 'bg-transparent text-dark-50 border-dark-20 hover:border-dark-50'
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="overflow-y-auto max-h-[400px] p-3 space-y-1">
        {filteredLog.map((entry) => {
          const showSeparator = entry.turn !== lastTurn;
          lastTurn = entry.turn;

          return (
            <div key={entry.id}>
              {showSeparator && (
                <div className="flex items-center gap-2 my-2 first:mt-0">
                  <div className="flex-1 border-t border-dark-20" />
                  <span className="text-micro text-accent-dark">TURN {entry.turn}</span>
                  <div className="flex-1 border-t border-dark-20" />
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className="flex gap-2 items-start"
              >
                <span className="text-micro text-dark-50 shrink-0 w-6 text-right">
                  T{entry.turn}
                </span>
                <span className={`text-body-sm ${TYPE_COLORS[entry.type] || 'text-dark'}`}>
                  {entry.message}
                </span>
              </motion.div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {log.length === 0 && (
        <div className="p-4 text-center">
          <span className="text-body-sm text-dark-50">Session events will appear here.</span>
        </div>
      )}
    </Panel>
  );
}
