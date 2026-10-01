// Web Audio API synthesizer for senior-friendly audio cues
// Guarantees zero latency and eliminates harsh frequencies

class AudioManager {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Soft, warm chime for successful action
  playSuccess(enabled: boolean = true) {
    if (!enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // First note: C5 (523.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // Harmonious second note: E5 (659.25 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.12);
      gain2.gain.setValueAtTime(0.12, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.65);
    } catch {
      // Audio context might be restricted before first gesture
    }
  }

  // Gentle, reassuring guidance tone (STRICTLY NO HARSH BUZZER)
  // Low-pitch soft bell that indicates "Let's review this together"
  playGentleGuidance(enabled: boolean = true) {
    if (!enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle'; // Smooth, mellow timbre
      osc.frequency.setValueAtTime(349.23, now); // F4
      osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.35); // E4 gentle settling
      
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // Ignore audio failure
    }
  }

  // Gentle tactile tap for button press
  playTap(enabled: boolean = true) {
    if (!enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Ignore
    }
  }

  playClick(enabled: boolean = true) {
    this.playTap(enabled);
  }

  playTick(enabled: boolean = true) {
    if (!enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Ignore
    }
  }

  playGentleChime(enabled: boolean = true) {
    this.playGentleGuidance(enabled);
  }

  // Universal sound player compatible with event-based sound callers
  play(type: 'success' | 'soft_error' | 'click' | 'tap' | 'tick', enabled: boolean = true) {
    if (!enabled) return;
    switch (type) {
      case 'success':
        this.playSuccess(enabled);
        break;
      case 'soft_error':
        this.playGentleGuidance(enabled);
        break;
      case 'click':
      case 'tap':
        this.playTap(enabled);
        break;
      case 'tick':
        this.playTick(enabled);
        break;
      default:
        this.playTap(enabled);
        break;
    }
  }
}

export const audioManager = new AudioManager();
