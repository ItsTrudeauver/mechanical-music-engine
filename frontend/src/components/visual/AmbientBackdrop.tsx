'use client';

export default function AmbientBackdrop() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Top Left Glow */}
      <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-white/[0.03] blur-[120px] rounded-full" />
      
      {/* Bottom Right Glow */}
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-white/[0.02] blur-[120px] rounded-full" />
      
      {/* Grid Overlay (The "Technical" texture) */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />
    </div>
  );
}