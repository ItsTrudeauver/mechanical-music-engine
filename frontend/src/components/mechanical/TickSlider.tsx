'use client';

import { useState, useRef } from 'react';
import { audio } from '@/lib/audio-engine';

interface TickSliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
}

export default function TickSlider({ value, min, max, onChange }: TickSliderProps) {
  const lastTickRef = useRef(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Number(e.target.value);
    
    // Only play sound if value actually changed step
    if (newVal !== lastTickRef.current) {
      audio.playClick(800 + (newVal * 5)); // Pitch rises with value
      lastTickRef.current = newVal;
    }
    
    onChange(newVal);
  };

  return (
    <div className="w-full flex items-center gap-4">
      <span className="font-mono text-xs text-mech-dim">{min}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
        className="w-full h-1 bg-mech-border rounded-lg appearance-none cursor-pointer hover:bg-mech-dim accent-mech-accent focus:outline-none"
      />
      <span className="font-mono text-xs text-mech-dim">{max}</span>
    </div>
  );
}