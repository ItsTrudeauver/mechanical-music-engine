import { ReactNode } from 'react';

interface DeckContainerProps {
  children: ReactNode;
}

export default function DeckContainer({ children }: DeckContainerProps) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative">
      {/* The main card/deck */}
      <div className="w-full max-w-md bg-mech-surface border border-mech-border rounded-xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-sm">
        
        {/* Decorative corner markers */}
        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-mech-dim" />
        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-mech-dim" />
        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-mech-dim" />
        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-mech-dim" />

        {children}
      </div>
      
      <div className="mt-8 text-mech-dim text-xs font-mono tracking-widest uppercase">
        System Online // v1.0
      </div>
    </div>
  );
}