/**
 * Web Audio engine for ChordArchitect
 * Warm pad synth with looping progression playback and tempo control
 */

/**
 * Tone.js based Web Audio engine for ChordArchitect
 */

import * as Tone from 'tone';
import { useHarmonyStore } from '../store/useHarmonyStore';

let synth: Tone.PolySynth | null = null;
let metronome: Tone.MembraneSynth | null = null;
let isInitialized = false;

/**
 * Initialize Tone.js audio engine 
 */
export async function initAudio() {
  if (isInitialized && synth && metronome) return;
  await Tone.start();

  // Create a clean sine wave pad
  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.1,
      decay: 0.2,
      sustain: 0.9,
      release: 1.2,
    }
  });
  
  // Add lowpass filtering to sweeten sawtooth edges, and a limiter to prevent polyphony clipping crackle
  const filter = new Tone.Filter(1500, 'lowpass');
  const limiter = new Tone.Limiter(-2); // Trap extreme peaks without distortion
  
  synth.chain(filter, limiter, Tone.Destination);
  
  // Drastically lower baseline headroom for dense chord polyphony (prevent summing clips)
  synth.volume.value = -12;

  // Create metronome click using a customized MembraneSynth to simulate a wood click
  metronome = new Tone.MembraneSynth({
    pitchDecay: 0.008,
    octaves: 2,
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0,
      release: 0.1,
    },
    volume: -10,
  }).toDestination();

  // No remote buffers needed
  isInitialized = true;
}

/**
 * Normalize and transpose note strings based on user's relative baseOctave
 */
function normalizeNote(noteName: string, baseOctave: number = 4): string {
  const octaveDiff = baseOctave - 4;
  const match = noteName.match(/^([A-Ga-g][#b]?)(\d+)$/);
  if (match) {
    const note = match[1];
    const oct = parseInt(match[2], 10);
    return `${note}${oct + octaveDiff}`;
  }
  if (/\d$/.test(noteName)) {
    return noteName;
  }
  return `${noteName}${baseOctave}`;
}

/**
 * Sync active synthesis configuration from zustand store
 */
function syncSynthConfig() {
  if (synth) {
    const { synthType } = useHarmonyStore.getState();
    synth.set({ oscillator: { type: synthType as any } });
  }
}

/**
 * Play a single chord (blasts all notes simultaneously)
 */
export function playChord(notes: string[], durationSeconds: number = 1.5): void {
  initAudio().then(() => {
    if (!synth) return;
    syncSynthConfig();
    const { baseOctave } = useHarmonyStore.getState();
    const normalized = notes.map(n => normalizeNote(n, baseOctave));
    synth.releaseAll();
    
    // Spread velocity slightly based on number of notes
    const velocity = Math.min(0.8, 2.0 / Math.max(notes.length, 1));
    synth.triggerAttackRelease(normalized, durationSeconds, undefined, velocity);
  }).catch(e => console.warn('Audio playback failed:', e));
}

export interface PlaybackOptions {
  bpm?: number;
  loop?: boolean;
  playStyle?: 'chord' | 'arpeggio';
  timeSignature?: '4/4' | '3/4';
  metronomeEnabled?: boolean;
  onChordChange?: (index: number) => void;
  onLoopComplete?: () => void;
}

/**
 * Play a progression using Tone.js Transport for accurate timing
 */
export function playProgression(
  chordPitchesList: string[][],
  options: PlaybackOptions = {}
): { stop: () => void } {
  let stopped = false;
  const loopPart = new Tone.Part(); // We'll manage our own Part to ensure clean cleanup

  initAudio().then(() => {
    if (stopped) return;
    syncSynthConfig();

    Tone.Transport.stop();
    Tone.Transport.cancel();
    if (synth) synth.releaseAll();

    Tone.Transport.bpm.value = options.bpm || 80;
    const beatsPerMeasure = options.timeSignature === '3/4' ? 3 : 4;
    Tone.Transport.timeSignature = beatsPerMeasure;

    const measureDurationSec = (60 / Tone.Transport.bpm.value) * beatsPerMeasure;
    let totalDurationSec = 0;

    // Schedule chords
    chordPitchesList.forEach((pitches, idx) => {
      const timeOffset = idx * measureDurationSec;

      // Schedule Audio Event
      Tone.Transport.schedule((time) => {
        if (stopped || !synth || !pitches || pitches.length === 0) return;
        
        // Dynamically pull store config at tick execution
        syncSynthConfig();
        const state = useHarmonyStore.getState();
        const normalized = pitches.map(n => normalizeNote(n, state.baseOctave));
        
        const velocity = Math.min(0.8, 2.0 / Math.max(pitches.length, 1));

        if (state.playStyle === 'arpeggio') {
          const stepSec = measureDurationSec / pitches.length;
          normalized.forEach((p, pIdx) => {
            synth!.triggerAttackRelease(p, stepSec * 0.9, time + pIdx * stepSec, velocity * 1.5);
          });
        } else {
          // Chord Blast (Removed sub-root bass duplicate note to avoid muddiness)
          synth.triggerAttackRelease(normalized, measureDurationSec * 0.9, time, velocity);
        }

        // Schedule UI Event (must be drawn via Tone.Draw for perfect sync)
        Tone.Draw.schedule(() => {
          if (!stopped && options.onChordChange) {
            options.onChordChange(idx);
          }
        }, time);

      }, timeOffset);
      
      // Schedule Metronome Clicks
      for (let b = 0; b < beatsPerMeasure; b++) {
        const clickTime = timeOffset + b * (60 / Tone.Transport.bpm.value);
        const note = b === 0 ? 'G5' : 'C5';
        const vel = b === 0 ? 0.8 : 0.4;
        Tone.Transport.schedule((time) => {
          if (stopped || !useHarmonyStore.getState().metronomeEnabled) return;
          if (metronome) {
            try {
              // Apply live UI volume preferences instantly (scaled in decibels)
              metronome.volume.value = useHarmonyStore.getState().metronomeVolume;
              // Synthesized wood block sound
              metronome.triggerAttackRelease(note, '32n', time, vel);
            } catch (e) {
              console.warn('Metronome click dropped:', e);
            }
          }
        }, clickTime);
      }

      totalDurationSec += measureDurationSec;
    });

    // Schedule Loop Reset or Stop
    Tone.Transport.schedule((time) => {
      if (stopped) return;
      
      Tone.Draw.schedule(() => {
        if (options.onLoopComplete) options.onLoopComplete();
      }, time);

      if (options.loop) {
        // We set Tone.Transport to loop
      } else {
        Tone.Transport.stop();
        Tone.Draw.schedule(() => {
           if (options.onChordChange) options.onChordChange(-1);
        }, time);
      }
    }, totalDurationSec);

    // Apply native Transport Loop
    if (options.loop) {
      Tone.Transport.setLoopPoints(0, totalDurationSec);
      Tone.Transport.loop = true;
    } else {
      Tone.Transport.loop = false;
    }

    Tone.Transport.start();
  });

  return { 
    stop: () => {
      stopped = true;
      Tone.Transport.stop();
      Tone.Transport.cancel();
      if (synth) synth.releaseAll();
    }
  };
}
