import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WheelSoundService {
  private audioContext: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  private beep(frequency: number, duration: number, volume = 0.15, type: OscillatorType = 'square'): void {
    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  }

  tick(): void {
    this.beep(900, 0.05);
  }

  fanfare(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      setTimeout(() => this.beep(freq, 0.25, 0.12, 'triangle'), i * 120);
    });
  }

  playTickSequence(totalDurationMs: number): void {
    const tickCount = 42;
    let elapsed = 0;
    for (let i = 0; i < tickCount; i++) {
      const progress = i / tickCount;
      const delay = 20 + progress * progress * 260;
      elapsed += delay;
      if (elapsed > totalDurationMs) break;
      setTimeout(() => this.tick(), elapsed);
    }
  }
}