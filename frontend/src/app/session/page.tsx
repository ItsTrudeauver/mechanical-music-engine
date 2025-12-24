'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/stores';
import DeckContainer from '@/components/layout/DeckContainer';
import AmbientBackdrop from '@/components/visual/AmbientBackdrop';
import ToggleSwitch from '@/components/mechanical/ToggleSwitch';
import TickSlider from '@/components/mechanical/TickSlider';
import Waveform from '@/components/visual/Waveform';

export default function SessionPage() {
  const router = useRouter();
  const { status, currentQuestion, finalTrack, candidatesCount, submitAnswer, reset } = useGameStore();
  
  // Slider state needs to be local before submitting
  const [sliderVal, setSliderVal] = useState(0);

  // Redirect if no session exists
  useEffect(() => {
    if (status === 'idle') {
      router.push('/');
    }
  }, [status, router]);

  // Handle Binary Answer (Yes/No)
  const handleBinary = async (answer: boolean) => {
    await submitAnswer(answer);
  };

  // Handle Slider Submit
  const handleSliderSubmit = async () => {
    // Logic: Is the slider value close to the question target?
    // For now, let's treat slider questions as binary in the backend, 
    // but the UI feels analog.
    // (Simplification for prototype: Mapping slider confirm to 'Yes')
    await submitAnswer(true); 
  };

  return (
    <main>
      <AmbientBackdrop />
      <DeckContainer>
        <AnimatePresence mode="wait">
          
          {/* LOADING STATE */}
          {status === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 space-y-4"
            >
              <div className="w-12 h-12 border-4 border-mech-dim border-t-mech-accent rounded-full animate-spin mx-auto" />
              <p className="font-mono text-xs text-mech-accent animate-pulse">
                COMPUTING ENTROPY...
              </p>
            </motion.div>
          )}

          {/* ACTIVE QUESTION STATE */}
          {status === 'active' && currentQuestion && (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full flex flex-col items-center gap-8"
            >
              {/* Header Info */}
              <div className="w-full flex justify-between items-center border-b border-mech-border pb-2">
                <span className="font-mono text-xs text-mech-dim">
                  CANDIDATES: {candidatesCount}
                </span>
                <span className="font-mono text-xs text-mech-dim">
                  FILTER: {currentQuestion.attribute.toUpperCase()}
                </span>
              </div>

              {/* The Question */}
              <h2 className="text-xl text-center font-bold text-mech-accent">
                {currentQuestion.text}
              </h2>

              {/* The Input Mechanism */}
              <div className="py-8 w-full flex justify-center">
                {currentQuestion.ui_type === 'slider' ? (
                  <div className="w-full space-y-6">
                    <TickSlider 
                      min={0} 
                      max={100} 
                      value={sliderVal} 
                      onChange={setSliderVal} 
                    />
                    <button 
                      onClick={handleSliderSubmit}
                      className="w-full py-2 bg-mech-border text-mech-accent font-mono text-xs uppercase hover:bg-mech-dim"
                    >
                      Confirm Value
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-12">
                    <ToggleSwitch 
                      label="NO" 
                      isOn={false} 
                      onToggle={() => handleBinary(false)} 
                    />
                    <ToggleSwitch 
                      label="YES" 
                      isOn={true} 
                      onToggle={() => handleBinary(true)} 
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* REVEAL STATE */}
          {status === 'reveal' && finalTrack && (
            <motion.div
              key="reveal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full flex flex-col gap-6 text-center"
            >
              <div className="space-y-1">
                <p className="font-mono text-xs text-mech-accent tracking-widest">
                  TARGET ACQUIRED
                </p>
                <h2 className="text-lg font-bold text-white leading-tight">
                  {finalTrack.title}
                </h2>
                <p className="text-mech-dim text-sm">{finalTrack.artist}</p>
              </div>

              {/* Visualizer */}
              <Waveform isPlaying={true} trackId={finalTrack.id} />

              {/* YouTube Embed */}
              <div className="aspect-video w-full bg-black rounded-lg overflow-hidden border border-mech-border shadow-inner">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${finalTrack.id}?autoplay=1`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>

              <button
                onClick={() => {
                  reset();
                  router.push('/');
                }}
                className="mt-4 text-xs font-mono text-mech-dim hover:text-mech-accent underline underline-offset-4"
              >
                INITIATE NEW SEARCH
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </DeckContainer>
    </main>
  );
}