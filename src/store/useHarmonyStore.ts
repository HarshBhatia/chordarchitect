/**
 * Central Zustand store for ChordArchitect
 */

import { create } from 'zustand';
import type { ChordInfo, Complexity, InstrumentType, ScaleType } from '../types';
import { getDiatonicChords } from '../engine/chords';
import { getScaleNotes } from '../engine/scales';
import { resolveTemplate, getSecondaryDominants } from '../engine/harmony';
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

  // Audio
  isPlaying: boolean;
  playingChordIndex: number;
  stopPlayback: (() => void) | null;
  bpm: number;
  looping: boolean;

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
  removeFromProgression: (index: number) => void;
  moveInProgression: (from: number, to: number) => void;
  clearProgression: () => void;
  loadTemplate: (templateName: string) => void;
  playSelectedChord: () => void;
  playFullProgression: () => void;
  stopAudio: () => void;
  setBpm: (bpm: number) => void;
  toggleLooping: () => void;
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
  progression: [],

  isPlaying: false,
  playingChordIndex: -1,
  stopPlayback: null,
  bpm: 80,
  looping: true,

  setRootNote: (note) => {
    const { scaleType, complexity } = get();
    const derived = computeDerived(note, scaleType, complexity);
    set({
      rootNote: note,
      ...derived,
      selectedChord: derived.diatonicChords[0] || null,
      voicingIndex: 0,
      progression: [],
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
      progression: [],
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

  addToProgression: (chord) => set(s => ({
    progression: [...s.progression, chord],
  })),

  insertInProgression: (chord, afterIndex) => set(s => {
    const newProg = [...s.progression];
    newProg.splice(afterIndex + 1, 0, chord);
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
    const { selectedChord } = get();
    if (selectedChord && selectedChord.notes.length > 0) {
      playChord(selectedChord.notes);
    }
  },

  playFullProgression: () => {
    const { progression, stopPlayback: existingStop, bpm, looping } = get();
    if (existingStop) existingStop();
    if (progression.length === 0) return;

    const chordNotes = progression.map(c =>
      c.notes.length > 0 ? c.notes : ['C', 'E', 'G']
    );

    const { stop } = playProgression(
      chordNotes,
      bpm,
      looping,
      (index) => {
        // Chord change callback
        if (index >= 0) {
          set({ playingChordIndex: index });
        } else {
          set({ isPlaying: false, playingChordIndex: -1, stopPlayback: null });
        }
      },
      () => {
        // Loop complete (only called if looping)
      },
    );

    set({ isPlaying: true, playingChordIndex: 0, stopPlayback: stop });
  },

  stopAudio: () => {
    const { stopPlayback } = get();
    if (stopPlayback) stopPlayback();
    set({ isPlaying: false, playingChordIndex: -1, stopPlayback: null });
  },

  setBpm: (bpm) => set({ bpm: Math.max(40, Math.min(200, bpm)) }),

  toggleLooping: () => set(s => ({ looping: !s.looping })),
}));
