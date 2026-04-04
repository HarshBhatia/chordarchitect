/**
 * Chord engine — builds diatonic chords from scales using tonal.js
 */

import { Chord, Note, Interval, Scale } from 'tonal';
import type { ChordInfo, Complexity, FunctionalRole, ScaleType } from '../types';
import { INTERVAL_DISPLAY, MAJOR_DEGREE_FUNCTIONS } from './constants';

/**
 * Convert an interval string to a human-readable display format
 */
export function intervalToDisplay(interval: string): string {
  return INTERVAL_DISPLAY[interval] || interval;
}

/**
 * Get functional role for a scale degree
 */
function getDegreeFunction(degree: number): FunctionalRole {
  return MAJOR_DEGREE_FUNCTIONS[degree] || 'tonic';
}

/**
 * Get roman numeral for a chord quality and degree
 */
function getRomanNumeral(degree: number, quality: string): string {
  const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  const base = numerals[degree - 1] || `${degree}`;

  // Determine case (uppercase = major/dom, lowercase = minor/dim)
  const isMinor = quality.includes('m') && !quality.includes('maj');
  const isDim = quality.includes('dim') || quality.includes('°');
  const isAug = quality.includes('aug') || quality.includes('+');

  let numeral = isMinor || isDim ? base.toLowerCase() : base;

  if (isDim) numeral += '°';
  if (isAug) numeral += '+';

  return numeral;
}

/**
 * Determine chord type suffix based on complexity level
 */
function getChordTypeForDegree(
  root: string,
  scaleNotes: string[],
  degree: number,
  complexity: Complexity
): { symbol: string; quality: string } {
  // Stack thirds from the scale to build the chord
  const scaleLen = scaleNotes.length;
  const idx = degree - 1;

  // Get notes by stacking thirds (every other scale degree)
  const stackedNotes: string[] = [];
  const stackCount = complexity === 1 ? 3 : complexity === 2 ? 4 : 5;

  for (let i = 0; i < stackCount; i++) {
    const noteIdx = (idx + i * 2) % scaleLen;
    stackedNotes.push(scaleNotes[noteIdx]);
  }

  // Use tonal to detect the chord from these notes
  const chordRoot = stackedNotes[0];

  // Calculate intervals between root and each note
  const intervals: number[] = stackedNotes.map(note => {
    const rootMidi = Note.midi(`${chordRoot}4`) ?? 60;
    let noteMidi = Note.midi(`${note}4`) ?? 60;
    let diff = (noteMidi - rootMidi + 12) % 12;
    return diff;
  });

  // Determine chord quality from interval pattern
  let quality = '';
  let symbol = chordRoot;

  if (complexity === 1) {
    // Triads
    const [, third, fifth] = intervals;
    if (third === 4 && fifth === 7) { quality = 'major'; symbol += ''; }
    else if (third === 3 && fifth === 7) { quality = 'minor'; symbol += 'm'; }
    else if (third === 3 && fifth === 6) { quality = 'dim'; symbol += 'dim'; }
    else if (third === 4 && fifth === 8) { quality = 'aug'; symbol += 'aug'; }
    else { quality = 'major'; }
  } else if (complexity === 2) {
    // 7th chords
    const [, third, fifth, seventh] = intervals;
    if (third === 4 && fifth === 7 && seventh === 11) { quality = 'maj7'; symbol += 'maj7'; }
    else if (third === 3 && fifth === 7 && seventh === 10) { quality = 'm7'; symbol += 'm7'; }
    else if (third === 4 && fifth === 7 && seventh === 10) { quality = '7'; symbol += '7'; }
    else if (third === 3 && fifth === 6 && seventh === 10) { quality = 'm7b5'; symbol += 'm7b5'; }
    else if (third === 3 && fifth === 6 && seventh === 9) { quality = 'dim7'; symbol += 'dim7'; }
    else if (third === 4 && fifth === 8 && seventh === 11) { quality = 'maj7#5'; symbol += 'maj7#5'; }
    else if (third === 3 && fifth === 7 && seventh === 11) { quality = 'mMaj7'; symbol += 'mMaj7'; }
    else { quality = 'maj7'; symbol += 'maj7'; }
  } else {
    // Extensions — use 7th + 9th
    const [, third, fifth, seventh] = intervals;
    if (third === 4 && fifth === 7 && seventh === 11) { quality = 'maj9'; symbol += 'maj9'; }
    else if (third === 3 && fifth === 7 && seventh === 10) { quality = 'm9'; symbol += 'm9'; }
    else if (third === 4 && fifth === 7 && seventh === 10) { quality = '9'; symbol += '9'; }
    else if (third === 3 && fifth === 6 && seventh === 10) { quality = 'm7b5'; symbol += 'm11b5'; }
    else if (third === 3 && fifth === 6 && seventh === 9) { quality = 'dim7'; symbol += 'dim9'; }
    else { quality = 'maj9'; symbol += 'maj9'; }
  }

  return { symbol, quality };
}

/**
 * Build all diatonic chords for a given key and complexity level
 */
export function getDiatonicChords(
  root: string,
  scaleType: ScaleType,
  complexity: Complexity
): ChordInfo[] {
  const scaleName = `${root} ${scaleType}`;
  const scale = Scale.get(scaleName);

  if (scale.empty || scale.notes.length === 0) return [];

  const scaleNotes = scale.notes;
  const chords: ChordInfo[] = [];

  for (let degree = 1; degree <= scaleNotes.length; degree++) {
    const { symbol, quality } = getChordTypeForDegree(root, scaleNotes, degree, complexity);
    const romanNumeral = getRomanNumeral(degree, quality);
    const func = getDegreeFunction(degree);

    // Get detailed chord info from tonal
    const chordData = Chord.get(symbol);
    const notes = chordData.notes.length > 0 ? chordData.notes : [scaleNotes[degree - 1]];
    const intervals = chordData.intervals.length > 0 ? chordData.intervals : ['1P'];
    const displayIntervals = intervals.map(intervalToDisplay);

    chords.push({
      symbol,
      root: scaleNotes[degree - 1],
      name: chordData.name || symbol,
      romanNumeral,
      degree,
      function: func,
      notes,
      intervals,
      displayIntervals,
    });
  }

  return chords;
}

/**
 * Get notes for a specific chord symbol
 */
export function getChordNotes(chordSymbol: string): string[] {
  const chord = Chord.get(chordSymbol);
  return chord.notes;
}

/**
 * Get intervals for a specific chord symbol
 */
export function getChordIntervals(chordSymbol: string): string[] {
  const chord = Chord.get(chordSymbol);
  return chord.intervals;
}

/**
 * Get the secondary dominant (V7) for a given target chord root
 */
export function getSecondaryDominant(targetRoot: string): string {
  // V7 of the target = a perfect 5th above the target, as a dominant 7th chord
  const v7Root = Note.transpose(targetRoot, '5P');
  if (!v7Root) return `${targetRoot}7`;
  // Strip octave
  const rootName = v7Root.replace(/\d+$/, '');
  return `${rootName}7`;
}
