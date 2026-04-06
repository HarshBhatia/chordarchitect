/**
 * Central Zustand store for ChordArchitect
 */

import { create } from 'zustand';
import type { ChordInfo, Complexity, InstrumentType, ScaleType } from '../types';
import { getDiatonicChords, applyChordModifications } from '../engine/chords';
import { getScaleNotes } from '../engine/scales';
import { resolveTemplate, getSecondaryDominants } from '../engine/harmony';
import { getGuitarVoicings, getVoicingPitches, getPianoInversionPitches, getClosestVoicingIndex } from '../engine/voicings';
import { playChord, playProgression } from '../engine/audio';

interface HarmonyState {
  // Core inputs
  rootNote: string;
  scaleType: ScaleType;
  complexity: Complexity;
  instrument: InstrumentType;
  showIntervals: boolean;
  showSecondaryDominants: boolean;

  // Derived data
  scaleNotes: string[];
  diatonicChords: ChordInfo[];
  secondaryDominants: ChordInfo[];

  // Selection
  selectedChord: ChordInfo | null;

  // Voicing cycling
  voicingIndex: number;

  // Progression builder
  progression: ChordInfo[];

  // Fretboard Mode
  fretboardMode: 'voicing' | 'all';

  // UI State
  isSettingsOpen: boolean;

  // Audio
  isPlaying: boolean;
  playingChordIndex: number;
  stopPlayback: (() => void) | null;
  bpm: number;
  looping: boolean;
  playStyle: 'chord' | 'arpeggio';
  timeSignature: '4/4' | '3/4';
  metronomeEnabled: boolean;
  autoVisualizePlayback: boolean;
  synthType: 'sine' | 'sawtooth' | 'square' | 'triangle';
  baseOctave: number;
  metronomeVolume: number;

  // Actions
  setRootNote: (note: string) => void;
  setScaleType: (scale: ScaleType) => void;
  setComplexity: (level: Complexity) => void;
  setInstrument: (inst: InstrumentType) => void;
  toggleIntervals: () => void;
  toggleSecondaryDominants: () => void;
  selectChord: (chord: ChordInfo | null) => void;
  nextVoicing: () => void;
  prevVoicing: () => void;
  addToProgression: (chord: ChordInfo) => void;
  insertInProgression: (chord: ChordInfo, afterIndex: number) => void;
  updateChordInProgression: (index: number, updates: Partial<ChordInfo>) => void;
  removeFromProgression: (index: number) => void;
  moveInProgression: (from: number, to: number) => void;
  clearProgression: () => void;
  loadTemplate: (templateName: string) => void;
  playSelectedChord: () => void;
  playFullProgression: () => void;
  stopAudio: () => void;
  setBpm: (bpm: number) => void;
  toggleLooping: () => void;
  setFretboardMode: (mode: 'voicing' | 'all') => void;
  setIsSettingsOpen: (isOpen: boolean) => void;
  setPlayStyle: (style: 'chord' | 'arpeggio') => void;
  setTimeSignature: (ts: '4/4' | '3/4') => void;
  setMetronomeEnabled: (enabled: boolean) => void;
  toggleMetronome: () => void;
  setAutoVisualizePlayback: (enabled: boolean) => void;
  toggleAutoVisualize: () => void;
  setSynthType: (type: 'sine' | 'sawtooth' | 'square' | 'triangle') => void;
  setBaseOctave: (octave: number) => void;
  setMetronomeVolume: (db: number) => void;
}

function computeDerived(rootNote: string, scaleType: ScaleType, complexity: Complexity) {
  const scaleNotes = getScaleNotes(rootNote, scaleType);
  const diatonicChords = getDiatonicChords(rootNote, scaleType, complexity);
  const secondaryDominants = getSecondaryDominants(rootNote, scaleType, complexity);
  return { scaleNotes, diatonicChords, secondaryDominants };
}

const initialRoot = 'C';
const initialScale: ScaleType = 'major';
const initialComplexity: Complexity = 2;
const initialDerived = computeDerived(initialRoot, initialScale, initialComplexity);

export const useHarmonyStore = create<HarmonyState>((set, get) => ({
  rootNote: initialRoot,
  scaleType: initialScale,
  complexity: initialComplexity,
  instrument: 'guitar',
  showIntervals: false,
  showSecondaryDominants: false,

  scaleNotes: initialDerived.scaleNotes,
  diatonicChords: initialDerived.diatonicChords,
  secondaryDominants: initialDerived.secondaryDominants,

  selectedChord: initialDerived.diatonicChords[0] || null,
  voicingIndex: 0,
  progression: resolveTemplate(initialRoot, initialScale, 'I-V-vi-IV', initialComplexity),

  isPlaying: false,
  playingChordIndex: -1,
  stopPlayback: null,
  bpm: 80,
  looping: true,
  playStyle: 'chord',
  timeSignature: '4/4',
  metronomeEnabled: false,
  autoVisualizePlayback: true,
  synthType: 'sine',
  baseOctave: 4,
  metronomeVolume: -10,

  fretboardMode: 'voicing',
  isSettingsOpen: false,

  setRootNote: (note) => {
    const { scaleType, complexity } = get();
    const derived = computeDerived(note, scaleType, complexity);
    set({
      rootNote: note,
      ...derived,
      selectedChord: derived.diatonicChords[0] || null,
      voicingIndex: 0,
    });
  },

  setScaleType: (scale) => {
    const { rootNote, complexity } = get();
    const derived = computeDerived(rootNote, scale, complexity);
    set({
      scaleType: scale,
      ...derived,
      selectedChord: derived.diatonicChords[0] || null,
      voicingIndex: 0,
    });
  },

  setComplexity: (level) => {
    const { rootNote, scaleType } = get();
    const derived = computeDerived(rootNote, scaleType, level);
    set({
      complexity: level,
      ...derived,
      selectedChord: derived.diatonicChords[0] || null,
      voicingIndex: 0,
      progression: [],
    });
  },

  setInstrument: (inst) => set({ instrument: inst }),

  toggleIntervals: () => set(s => ({ showIntervals: !s.showIntervals })),

  toggleSecondaryDominants: () => set(s => ({ showSecondaryDominants: !s.showSecondaryDominants })),

  selectChord: (chord) => set({ selectedChord: chord, voicingIndex: 0 }),

  nextVoicing: () => set(s => ({ voicingIndex: s.voicingIndex + 1 })),
  prevVoicing: () => set(s => ({ voicingIndex: Math.max(0, s.voicingIndex - 1) })),

  addToProgression: (chord) => set(s => {
    if (s.progression.length >= 16) return { progression: s.progression };
    return { progression: [...s.progression, chord] };
  }),

  insertInProgression: (chord, afterIndex) => set(s => {
    const newProg = [...s.progression];
    newProg.splice(afterIndex + 1, 0, chord);
    return { progression: newProg };
  }),

  updateChordInProgression: (index, updates) => set(s => {
    const newProg = [...s.progression];
    const target = newProg[index];
    if (target) {
      newProg[index] = applyChordModifications(target, updates, s.rootNote, s.scaleType);
      
      // If we are currently selecting this chord, update selection as well
      if (s.selectedChord && s.selectedChord.degree === target.degree && s.selectedChord.symbol === target.symbol) {
        return { progression: newProg, selectedChord: newProg[index], voicingIndex: 0 };
      }
    }
    return { progression: newProg };
  }),

  removeFromProgression: (index) => set(s => ({
    progression: s.progression.filter((_, i) => i !== index),
  })),

  moveInProgression: (from, to) => set(s => {
    const newProg = [...s.progression];
    const [item] = newProg.splice(from, 1);
    newProg.splice(to, 0, item);
    return { progression: newProg };
  }),

  clearProgression: () => set({ progression: [] }),

  loadTemplate: (templateName) => {
    const { rootNote, scaleType, complexity } = get();
    const chords = resolveTemplate(rootNote, scaleType, templateName, complexity);
    set({ progression: chords });
  },

  playSelectedChord: () => {
    const { selectedChord, instrument } = get();
    if (selectedChord && selectedChord.notes.length > 0) {
      if (instrument === 'guitar') {
        const voicings = getGuitarVoicings(selectedChord.symbol);
        const pitches = getVoicingPitches(voicings[0].frets);
        playChord(pitches);
      } else {
        const pitches = getPianoInversionPitches(selectedChord.notes, selectedChord.pianoInversion || 0, 3);
        playChord(pitches);
      }
    }
  },

  playFullProgression: () => {
    const { 
      progression, 
      stopPlayback: existingStop, 
      bpm, 
      looping,
      playStyle,
      timeSignature,
      metronomeEnabled,
      autoVisualizePlayback,
      instrument,
      selectChord
    } = get();

    if (existingStop) existingStop();
    if (progression.length === 0) return;

    // Ensure Tone.js plays the entire chord in 2 octaves uniformly in progression 
    // instead of relying on narrow voicings from specific instruments
    const chordPitchesList = progression.map(c => {
      const octave3 = c.notes.map(n => `${n}3`);
      const octave4 = c.notes.map(n => `${n}4`);
      return [...octave3, ...octave4];
    });

    const { stop } = playProgression(chordPitchesList, {
      bpm,
      loop: looping,
      playStyle,
      timeSignature,
      metronomeEnabled,
      onChordChange: (index) => {
        // Chord change callback
        if (index >= 0) {
          const { selectedChord, voicingIndex, selectChord, fretboardMode } = get();
          set({ playingChordIndex: index });
          if (autoVisualizePlayback && progression[index]) {
            if (fretboardMode === 'voicing' && selectedChord) {
              const bestIdx = getClosestVoicingIndex(selectedChord.symbol, voicingIndex, progression[index].symbol);
              set({ selectedChord: progression[index], voicingIndex: bestIdx });
            } else {
              selectChord(progression[index]);
            }
          }
        } else {
          set({ isPlaying: false, playingChordIndex: -1, stopPlayback: null });
        }
      },
      onLoopComplete: () => {
        // Loop complete (only called if looping)
      },
    });

    set({ isPlaying: true, playingChordIndex: 0, stopPlayback: stop });
  },

  stopAudio: () => {
    const { stopPlayback } = get();
    if (stopPlayback) stopPlayback();
    set({ isPlaying: false, playingChordIndex: -1, stopPlayback: null });
  },

  setBpm: (bpm) => set({ bpm: Math.max(40, Math.min(200, bpm)) }),

  toggleLooping: () => set(s => ({ looping: !s.looping })),

  setFretboardMode: (mode) => set({ fretboardMode: mode }),

  setIsSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),

  setPlayStyle: (style) => set({ playStyle: style }),
  setTimeSignature: (ts) => set({ timeSignature: ts }),
  setMetronomeEnabled: (enabled) => set({ metronomeEnabled: enabled }),
  toggleMetronome: () => set(s => ({ metronomeEnabled: !s.metronomeEnabled })),
  setAutoVisualizePlayback: (enabled) => set({ autoVisualizePlayback: enabled }),
  toggleAutoVisualize: () => set(s => ({ autoVisualizePlayback: !s.autoVisualizePlayback })),
  setSynthType: (type) => set({ synthType: type }),
  setBaseOctave: (octave) => set({ baseOctave: octave }),
  setMetronomeVolume: (db) => set({ metronomeVolume: db }),
}));
