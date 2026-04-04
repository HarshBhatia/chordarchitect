/**
 * Web Audio engine for ChordArchitect
 * Warm pad synth with looping progression playback and tempo control
 */

import { Note } from 'tonal';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a single note with a warm pad sound
 */
function playNote(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  volume: number = 0.12,
): void {
  // Oscillator 1: Triangle for warmth
  const osc1 = ctx.createOscillator();
  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime(frequency, startTime);

  // Oscillator 2: Sine slightly detuned for richness
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(frequency * 1.002, startTime);

  // Gain envelope (attack-decay-sustain-release)
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.05);
  gainNode.gain.setValueAtTime(volume * 0.8, startTime + 0.1);
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

  // Low-pass filter for softness
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000, startTime);
  filter.Q.setValueAtTime(0.5, startTime);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc1.start(startTime);
  osc2.start(startTime);
  osc1.stop(startTime + duration + 0.1);
  osc2.stop(startTime + duration + 0.1);
}

/**
 * Get a playable frequency for a note name (adds octave if missing)
 */
function noteToFreq(noteName: string): number | null {
  if (/\d$/.test(noteName)) {
    return Note.freq(noteName);
  }
  return Note.freq(`${noteName}4`);
}

/**
 * Play a chord (all notes simultaneously)
 */
export function playChord(notes: string[], duration: number = 1.5): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const vol = Math.min(0.15, 0.6 / Math.max(notes.length, 1));

    notes.forEach((note, i) => {
      const freq = noteToFreq(note);
      if (freq) {
        playNote(ctx, freq, now + i * 0.03, duration, vol);
        if (i === 0) {
          playNote(ctx, freq / 2, now, duration, vol * 0.6);
        }
      }
    });
  } catch (e) {
    console.warn('Audio playback failed:', e);
  }
}

/**
 * Schedule one pass of the progression into the audio context
 * Returns the total duration of this pass
 */
function schedulePass(
  ctx: AudioContext,
  chordNotesList: string[][],
  bpm: number,
  startTime: number,
): number {
  const beatDuration = 60 / bpm;
  const chordDuration = beatDuration * 4;

  chordNotesList.forEach((notes, chordIdx) => {
    const chordStart = startTime + chordIdx * chordDuration;
    const vol = Math.min(0.13, 0.5 / Math.max(notes.length, 1));

    notes.forEach((note, noteIdx) => {
      const freq = noteToFreq(note);
      if (freq) {
        playNote(ctx, freq, chordStart + noteIdx * 0.025, chordDuration * 0.9, vol);
        if (noteIdx === 0) {
          playNote(ctx, freq / 2, chordStart, chordDuration * 0.9, vol * 0.5);
        }
      }
    });
  });

  return chordNotesList.length * chordDuration;
}

/**
 * Play a progression — supports looping and variable tempo
 * Returns a stop function and callbacks for chord index changes
 */
export function playProgression(
  chordNotesList: string[][],
  bpm: number = 80,
  loop: boolean = false,
  onChordChange?: (index: number) => void,
  onLoopComplete?: () => void,
): { stop: () => void } {
  let stopped = false;
  let timeoutIds: ReturnType<typeof setTimeout>[] = [];

  const stop = () => {
    stopped = true;
    timeoutIds.forEach(id => clearTimeout(id));
    timeoutIds = [];
    if (audioCtx) {
      audioCtx.close().catch(() => {});
      audioCtx = null;
    }
  };

  const beatDuration = 60 / bpm;
  const chordDuration = beatDuration * 4;
  const passDuration = chordNotesList.length * chordDuration;

  function playPass(passStartMs: number) {
    if (stopped) return;

    try {
      const ctx = getAudioContext();
      schedulePass(ctx, chordNotesList, bpm, ctx.currentTime + 0.05);
    } catch (e) {
      console.warn('Progression playback failed:', e);
      return;
    }

    // Schedule chord index callbacks
    chordNotesList.forEach((_, idx) => {
      const id = setTimeout(() => {
        if (!stopped && onChordChange) onChordChange(idx);
      }, passStartMs + idx * chordDuration * 1000);
      timeoutIds.push(id);
    });

    // Schedule end-of-pass
    const endId = setTimeout(() => {
      if (stopped) return;
      if (onLoopComplete) onLoopComplete();
      if (loop && !stopped) {
        // Re-create audio context for next loop pass (previous one may have ramp-downs)
        if (audioCtx) {
          audioCtx.close().catch(() => {});
          audioCtx = null;
        }
        playPass(0);
      } else {
        stop();
        if (onChordChange) onChordChange(-1);
      }
    }, passStartMs + passDuration * 1000 + 100);
    timeoutIds.push(endId);
  }

  playPass(0);

  return { stop };
}
