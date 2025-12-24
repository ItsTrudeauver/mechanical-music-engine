'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/stores';
import DeckContainer from '@/components/layout/DeckContainer';
import AmbientBackdrop from '@/components/visual/AmbientBackdrop';
import { audio } from '@/lib/audio-engine';

export default function Home() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const startSession = useGameStore((state) => state.startSession);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    audio.playClick(800); // Confirmation click
    await startSession(query);
    router.push('/session');
  };

  return (
    <main>
      <AmbientBackdrop />
      <DeckContainer>
        <div className="flex flex-col gap-8 text-center">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tighter text-mech-accent uppercase">
              Mechanical Discovery
            </h1>
            <p className="text-sm text-mech-dim font-mono">
              Deterministic Music Filtering Engine
            </p>
          </div>

          <form onSubmit={handleStart} className="flex flex-col gap-4">
            <div className="relative group">
              <input
                type="text"
                placeholder="ENTER SEED (e.g., Japanese Jazz)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-black/50 border border-mech-border text-mech-accent p-4 text-center font-mono focus:outline-none focus:border-mech-accent transition-colors"
                autoFocus
              />
              {/* Corner accents for the input */}
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-mech-dim group-focus-within:border-mech-accent" />
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-mech-dim group-focus-within:border-mech-accent" />
            </div>

            <button
              type="submit"
              disabled={!query}
              className="bg-mech-surface border border-mech-border hover:bg-mech-border text-mech-accent py-3 px-6 font-mono text-sm tracking-widest uppercase transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Initialize System
            </button>
          </form>
        </div>
      </DeckContainer>
    </main>
  );
}