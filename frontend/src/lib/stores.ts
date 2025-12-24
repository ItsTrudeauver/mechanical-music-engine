import { create } from 'zustand';
import { api, Question, Track } from './api';

interface GameState {
  sessionId: string | null;
  status: 'idle' | 'loading' | 'active' | 'reveal';
  candidatesCount: number;
  currentQuestion: Question | null;
  finalTrack: Track | null;
  
  // Actions
  startSession: (query: string) => Promise<void>;
  submitAnswer: (answer: boolean) => Promise<void>;
  reset: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  sessionId: null,
  status: 'idle',
  candidatesCount: 0,
  currentQuestion: null,
  finalTrack: null,

  startSession: async (query) => {
    set({ status: 'loading' });
    try {
      const data = await api.start(query);
      set({
        sessionId: data.session_id,
        candidatesCount: data.total_candidates,
        currentQuestion: data.question,
        status: 'active'
      });
    } catch (e) {
      console.error(e);
      set({ status: 'idle' }); // Reset on fail
    }
  },

  submitAnswer: async (answer) => {
    const { sessionId, currentQuestion } = get();
    if (!sessionId || !currentQuestion) return;

    // Optimistic update (optional, but let's keep it simple for now)
    set({ status: 'loading' });

    try {
      const data = await api.answer(sessionId, currentQuestion.id, answer);
      
      if (data.status === 'reveal' && data.track) {
        set({
          status: 'reveal',
          finalTrack: data.track,
          currentQuestion: null
        });
      } else if (data.question) {
        set({
          status: 'active',
          currentQuestion: data.question,
          candidatesCount: data.remaining_candidates || 0
        });
      }
    } catch (e) {
      console.error(e);
      set({ status: 'active' }); // Revert on fail
    }
  },

  reset: () => set({ sessionId: null, status: 'idle', currentQuestion: null, finalTrack: null })
}));