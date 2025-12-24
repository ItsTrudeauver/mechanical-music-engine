class MechanicalAudio {
  private ctx: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
  }

  private async resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  playClick(pitch: number = 1000) {
    if (!this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    // Sound Profile: High pitch sine wave with sharp decay
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, t);
    
    // Envelope (The "Click" shape)
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  playHover() {
    // A lower, quieter tick for hover states
    this.playClick(600); 
  }
}

// Export a singleton instance
export const audio = new MechanicalAudio();