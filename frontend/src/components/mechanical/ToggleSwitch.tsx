'use client';

import { motion } from 'framer-motion';
import { audio } from '@/lib/audio-engine';

interface ToggleSwitchProps {
  label: string;
  isOn: boolean;
  onToggle: () => void;
}

export default function ToggleSwitch({ label, isOn, onToggle }: ToggleSwitchProps) {
  const handleClick = () => {
    // Different pitch for On vs Off
    audio.playClick(isOn ? 800 : 1200); 
    onToggle();
  };

  return (
    <button
      onClick={handleClick}
      className="group flex flex-col items-center gap-2 outline-none"
    >
      <div 
        className={`
          w-16 h-8 rounded-full p-1 transition-colors duration-300
          ${isOn ? 'bg-mech-accent' : 'bg-mech-surface border border-mech-border'}
        `}
      >
        <motion.div
          className={`w-6 h-6 rounded-full shadow-md ${isOn ? 'bg-black' : 'bg-mech-dim'}`}
          layout
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
          style={{
            x: isOn ? 32 : 0 
          }}
        />
      </div>
      <span className={`font-mono text-sm tracking-wider uppercase ${isOn ? 'text-mech-accent' : 'text-mech-dim'}`}>
        {label}
      </span>
    </button>
  );
}