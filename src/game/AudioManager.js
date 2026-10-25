// Synthesised SFX via Web Audio. No audio files needed; starts after a user gesture.
export class AudioManager {
  constructor(muted = false) { this.muted = muted; this.ctx = null; }
  unlock() {
    try {
      if (!this.ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return; this.ctx = new C(); }
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch { /* audio unavailable */ }
  }
  tone(f, d, { type = 'sine', vol = 0.12, to = f, delay = 0 } = {}) {
    const c = this.ctx; if (!c) return;
    const t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + d);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + 0.02);
  }
  play(name) {
    if (this.muted || !this.ctx) return;
    switch (name) {
      case 'coconut': this.tone(660, 0.12, { type: 'triangle', to: 990 }); break;
      case 'milk': this.tone(523, 0.1, { type: 'triangle' }); this.tone(784, 0.18, { type: 'triangle', delay: 0.08 }); break;
      case 'jump': this.tone(300, 0.18, { type: 'square', to: 600, vol: 0.05 }); break;
      case 'hit': this.tone(140, 0.3, { type: 'sawtooth', to: 50, vol: 0.15 }); break;
      case 'over': [400, 320, 240, 160].forEach((f, i) => this.tone(f, 0.25, { type: 'triangle', delay: i * 0.18 })); break;
      default: this.tone(440, 0.05, { type: 'triangle', vol: 0.06 });
    }
  }
}
