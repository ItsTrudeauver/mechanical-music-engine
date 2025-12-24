'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface WaveformProps {
  isPlaying: boolean;
  trackId: string; // We use this to seed the random heights
}

export default function Waveform({ isPlaying, trackId }: WaveformProps) {
  // Generate a static "fingerprint" of bar heights based on the track ID
  const bars = useMemo(() => {
    const seed = trackId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Array.from({ length: 40 }).map((_, i) => {
      // Pseudo-random height between 20% and 100%
      const height = 20 + ((seed * (i + 1) * 9301 + 49297) % 233280) % 80;
      return height;
    });
  }, [trackId]);

  return (
    <div className="flex items-center justify-center gap-[2px] h-32 w-full overflow-hidden">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className="w-1 bg-mech-accent rounded-full opacity-80"
          initial={{ height: `${height}%` }}
          animate={isPlaying ? {
            height: [`${height}%`, `${height * 0.5}%`, `${height}%`],
            opacity: [0.8, 0.4, 0.8]
          } : {
            height: `${height}%`,
            opacity: 0.3
          }}
          transition={{
            duration: 0.5,
            repeat: isPlaying ? Infinity : 0,
            delay: i * 0.05, // Ripple effect
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}