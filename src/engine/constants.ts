/**
 * Constants for ChordArchitect music theory engine
 */

import type { FunctionalRole, ProgressionTemplate, ScaleType } from '../types';

/** All chromatic notes with sharps */
export const SHARP_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

/** All chromatic notes with flats */
export const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

/** Root notes available for selection (including enharmonic) */
export const ROOT_NOTES = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'] as const;

/** Simplified selectable root notes (no duplicates) */
export const SELECTABLE_ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

/** Guitar standard tuning (low to high) */
export const GUITAR_TUNING = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'] as const;

/** Guitar string note names */
export const GUITAR_STRING_NOTES = ['E', 'A', 'D', 'G', 'B', 'E'] as const;

/** Number of frets to display */
export const FRET_COUNT = 15;

/** Piano range for display */
export const PIANO_START_NOTE = 'C3';
export const PIANO_END_NOTE = 'B5';
export const PIANO_OCTAVE_START = 3;
export const PIANO_OCTAVE_END = 5;

/** Available scales with display metadata */
export const AVAILABLE_SCALES: { type: ScaleType; label: string; category: string }[] = [
  { type: 'major', label: 'Major (Ionian)', category: 'Major Modes' },
  { type: 'dorian', label: 'Dorian', category: 'Major Modes' },
  { type: 'phrygian', label: 'Phrygian', category: 'Major Modes' },
  { type: 'lydian', label: 'Lydian', category: 'Major Modes' },
  { type: 'mixolydian', label: 'Mixolydian', category: 'Major Modes' },
  { type: 'aeolian', label: 'Aeolian', category: 'Major Modes' },
  { type: 'locrian', label: 'Locrian', category: 'Major Modes' },
  { type: 'natural minor', label: 'Natural Minor', category: 'Minor Variants' },
  { type: 'harmonic minor', label: 'Harmonic Minor', category: 'Minor Variants' },
  { type: 'melodic minor', label: 'Melodic Minor', category: 'Minor Variants' },
];

/** Functional role for each diatonic degree in major scale */
export const MAJOR_DEGREE_FUNCTIONS: Record<number, FunctionalRole> = {
  1: 'tonic',
  2: 'subdominant',
  3: 'tonic',
  4: 'subdominant',
  5: 'dominant',
  6: 'tonic',
  7: 'dominant',
};

/** Colors for functional roles */
export const FUNCTION_COLORS: Record<FunctionalRole, string> = {
  tonic: '#4A9EFF',
  subdominant: '#34D399',
  dominant: '#F87171',
};

/** Glow colors for functional roles */
export const FUNCTION_GLOW_COLORS: Record<FunctionalRole, string> = {
  tonic: 'rgba(74, 158, 255, 0.3)',
  subdominant: 'rgba(52, 211, 153, 0.3)',
  dominant: 'rgba(248, 113, 113, 0.3)',
};

/** Progression templates */
export const PROGRESSION_TEMPLATES: ProgressionTemplate[] = [
  { name: 'I-IV-V', numerals: ['I', 'IV', 'V'], label: 'Classic Rock' },
  { name: 'ii-V-I', numerals: ['ii', 'V', 'I'], label: 'Jazz Standard' },
  { name: 'I-vi-ii-V', numerals: ['I', 'vi', 'ii', 'V'], label: 'Turnaround' },
  { name: 'I-V-vi-IV', numerals: ['I', 'V', 'vi', 'IV'], label: 'Pop Canon' },
  { name: 'I-IV-vi-V', numerals: ['I', 'IV', 'vi', 'V'], label: 'Modern Pop' },
  { name: 'vi-IV-I-V', numerals: ['vi', 'IV', 'I', 'V'], label: 'Emotional' },
  { name: 'ii-V-I-vi', numerals: ['ii', 'V', 'I', 'vi'], label: 'Jazz Cycle' },
  { name: 'I-bVII-IV-I', numerals: ['I', 'bVII', 'IV', 'I'], label: 'Mixolydian' },
];

/** Roman numeral labels for degrees */
export const ROMAN_NUMERALS_MAJOR = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
export const ROMAN_NUMERALS_MINOR = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];

/** Interval display mapping */
export const INTERVAL_DISPLAY: Record<string, string> = {
  '1P': 'R',
  '2m': 'b2',
  '2M': '2',
  '3m': 'b3',
  '3M': '3',
  '4P': '4',
  '4A': '#4',
  '5d': 'b5',
  '5P': '5',
  '5A': '#5',
  '6m': 'b6',
  '6M': '6',
  '7m': 'b7',
  '7M': '7',
  '8P': 'R',
  '9m': 'b9',
  '9M': '9',
  '9A': '#9',
  '11P': '11',
  '11A': '#11',
  '13m': 'b13',
  '13M': '13',
};

/** Per-interval marker colors for chord visualization */
export const INTERVAL_COLORS: Record<string, string> = {
  'R':   '#F59E0B', // amber — root
  'b2':  '#A78BFA', // violet
  '2':   '#A78BFA', // violet
  'b3':  '#60A5FA', // blue
  '3':   '#60A5FA', // blue
  '4':   '#34D399', // emerald
  '#4':  '#34D399', // emerald
  'b5':  '#F87171', // red
  '5':   '#E879F9', // fuchsia
  '#5':  '#E879F9', // fuchsia
  'b6':  '#FB923C', // orange
  '6':   '#FB923C', // orange
  'b7':  '#38BDF8', // sky
  '7':   '#38BDF8', // sky
  'b9':  '#A78BFA',
  '9':   '#A78BFA',
  '#9':  '#A78BFA',
  '11':  '#34D399',
  '#11': '#34D399',
  'b13': '#FB923C',
  '13':  '#FB923C',
};

/** Fret marker positions (inlay dots) */
export const FRET_MARKERS = [3, 5, 7, 9, 12, 15];
export const DOUBLE_FRET_MARKERS = [12];
