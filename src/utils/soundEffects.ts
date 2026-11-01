// Web Audio API Sound Effects & Classroom Rhythm Chant Metronome

const SFX_MUTE_KEY = 'lekimlang_sfx_muted';

let audioCtx: AudioContext | null = null;
let metronomeTimer: any = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isSfxMuted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(SFX_MUTE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function toggleSfxMute(): boolean {
  const next = !isSfxMuted();
  try {
    localStorage.setItem(SFX_MUTE_KEY, String(next));
  } catch {}
  if (next) {
    stopChantMetronome();
  }
  return next;
}

/**
 * Cheerful ascending chime when answering correctly or earning stars
 */
export function playSuccessSound(): void {
  if (isSfxMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.18, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.3);
    });
  } catch {}
}

/**
 * Gentle low double-tone when an answer is wrong
 */
export function playErrorSound(): void {
  if (isSfxMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [220, 174.61]; // A3 -> F3
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.14);

      gain.gain.setValueAtTime(0.12, now + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.14);
      osc.stop(now + idx * 0.14 + 0.24);
    });
  } catch {}
}

/**
 * Short wooden click / tick sound for wheel spinner & card flip
 */
export function playTickSound(): void {
  if (isSfxMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.045);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.055);
  } catch {}
}

/**
 * Single rhythmic clap / drum beat for Classroom Chants (2/4 rhythm)
 */
export function playClapBeat(isStrongBeat = true): void {
  if (isSfxMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isStrongBeat ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isStrongBeat ? 440 : 660, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.09);

    gain.gain.setValueAtTime(isStrongBeat ? 0.22 : 0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.11);
  } catch {}
}

/**
 * Start a steady 2/4 clapping rhythm metronome for reading Classroom Chants
 */
export function startChantMetronome(bpm = 105, onBeat?: (beatIndex: number) => void): void {
  stopChantMetronome();
  let beat = 0;
  const intervalMs = Math.round((60 / bpm) * 1000);

  playClapBeat(true);
  onBeat?.(0);

  metronomeTimer = setInterval(() => {
    beat = (beat + 1) % 4;
    playClapBeat(beat % 2 === 0);
    onBeat?.(beat);
  }, intervalMs);
}

export function stopChantMetronome(): void {
  if (metronomeTimer) {
    clearInterval(metronomeTimer);
    metronomeTimer = null;
  }
}
