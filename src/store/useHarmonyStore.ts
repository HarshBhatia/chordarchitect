/**
 * Central Zustand store for ChordArchitect
 */

import { create } from 'zustand';
import type { ChordInfo, Complexity, InstrumentType, ScaleType } from '../types';
import { getDiatonicChords } from '../engine/chords';
import { getScaleNotes } from '../engine/scales';
import { resolveTemplate, getSecondaryDominants } from '../engine/harmony';

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

  // Progression builder
  progression: ChordInfo[];

  // Actions
  setRootNote: (note: string) => void;
  setScaleType: (scale: ScaleType) => void;
  setComplexity: (level: Complexity) => void;
  setInstrument: (inst: InstrumentType) => void;
  toggleIntervals: () => void;
  toggleSecondaryDominants: () => void;
  selectChord: (chord: ChordInfo | null) => void;
  addToProgression: (chord: ChordInfo) => void;
  removeFromProgression: (index: number) => void;
  moveInProgression: (from: number, to: number) => void;
  clearProgression: () => void;
  loadTemplate: (templateName: string) => void;
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
  progression: [],

  setRootNote: (note) => {
    const { scaleType, complexity } = get();
    const derived = computeDerived(note, scaleType, complexity);
    set({
      rootNote: note,
      ...derived,
      selectedChord: derived.diatonicChords[0] || null,
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
      progression: [],
    });
  },

  setInstrument: (inst) => set({ instrument: inst }),

  toggleIntervals: () => set(s => ({ showIntervals: !s.showIntervals })),

  toggleSecondaryDominants: () => set(s => ({ showSecondaryDominants: !s.showSecondaryDominants })),

  selectChord: (chord) => set({ selectedChord: chord }),

  addToProgression: (chord) => set(s => ({
    progression: [...s.progression, chord],
  })),

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
}));
