/**
 * Core types for ChordArchitect
 */

export type NoteName = string; // e.g. 'C', 'C#', 'Db'

export type ScaleType =
  | 'major'
  | 'natural minor'
  | 'harmonic minor'
  | 'melodic minor'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'aeolian'
  | 'locrian';

export type Complexity = 1 | 2 | 3;

export type InstrumentType = 'guitar' | 'piano';

export type FunctionalRole = 'tonic' | 'subdominant' | 'dominant';

export interface ChordInfo {
  /** The full chord symbol e.g. "Cmaj7" */
  symbol: string;
  /** The root note of the chord e.g. "C" */
  root: string;
  /** Human-readable name e.g. "C major seventh" */
  name: string;
  /** Roman numeral e.g. "I", "ii", "iii" */
  romanNumeral: string;
  /** Scale degree (1-indexed) */
  degree: number;
  /** Functional role in the key */
  function: FunctionalRole;
  /** Notes in the chord e.g. ["C", "E", "G", "B"] */
  notes: string[];
  /** Intervals e.g. ["1P", "3M", "5P", "7M"] */
  intervals: string[];
  /** Display intervals e.g. ["R", "3", "5", "7"] */
  displayIntervals: string[];
  /** Whether this is a secondary dominant */
  isSecondaryDominant?: boolean;
  /** Target chord for secondary dominant e.g. "ii" */
  secondaryDominantTarget?: string;
}

export interface GuitarVoicing {
  /** Fret numbers for each string (low E to high E), -1 = muted, 0 = open */
  frets: number[];
  /** Finger positions (optional) */
  fingers?: number[];
  /** Starting fret for barre chords */
  baseFret: number;
  /** Label for the voicing */
  label?: string;
}

export interface PianoVoicing {
  /** MIDI note numbers for the voicing */
  midiNotes: number[];
  /** Note names */
  noteNames: string[];
}

export interface FretMarker {
  string: number; // 0-5 (low E = 0)
  fret: number;   // 0-22
  note: string;
  interval: string;
  displayInterval: string;
  isRoot: boolean;
}

export interface KeyMarker {
  midiNote: number;
  note: string;
  octave: number;
  interval: string;
  displayInterval: string;
  isRoot: boolean;
  isBlackKey: boolean;
}

export interface ProgressionTemplate {
  name: string;
  numerals: string[];
  label: string;
}
