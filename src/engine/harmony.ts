/**
 * Harmony engine — functional harmony, roman numerals, progression resolution
 */

import { Note, Chord } from 'tonal';
import type { ChordInfo, Complexity, ScaleType } from '../types';
import { PROGRESSION_TEMPLATES, INTERVAL_DISPLAY } from './constants';
import { getDiatonicChords, getSecondaryDominant } from './chords';

/**
 * Helper: get notes and intervals for a chord symbol using tonal
 */
function resolveChordNotes(symbol: string): { notes: string[]; intervals: string[]; displayIntervals: string[] } {
  const info = Chord.get(symbol);
  if (!info || !info.notes || info.notes.length === 0) {
    // Fallback: try common patterns
    return { notes: [], intervals: [], displayIntervals: [] };
  }
  const intervals = info.intervals || [];
  const displayIntervals = intervals.map(iv => INTERVAL_DISPLAY[iv] || iv);
  return { notes: info.notes, intervals, displayIntervals };
}

/**
 * Resolve a progression template into concrete chords
 */
export function resolveTemplate(
  root: string,
  scaleType: ScaleType,
  templateName: string,
  complexity: Complexity
): ChordInfo[] {
  const template = PROGRESSION_TEMPLATES.find(t => t.name === templateName);
  if (!template) return [];

  const diatonic = getDiatonicChords(root, scaleType, complexity);
  if (diatonic.length === 0) return [];

  const result: ChordInfo[] = [];

  for (const numeral of template.numerals) {
    // Parse the roman numeral to find the degree
    const degree = romanNumeralToDegree(numeral);
    if (degree >= 1 && degree <= diatonic.length) {
      result.push({ ...diatonic[degree - 1] });
    }
  }

  return result;
}

/**
 * Convert a roman numeral string to a scale degree number
 */
function romanNumeralToDegree(numeral: string): number {
  // Strip annotations like °, +, b, #
  const clean = numeral.replace(/[°+b#]/g, '').toLowerCase();

  const map: Record<string, number> = {
    'i': 1, 'ii': 2, 'iii': 3, 'iv': 4, 'v': 5, 'vi': 6, 'vii': 7,
  };

  return map[clean] || 0;
}

/**
 * Get all secondary dominants for diatonic chords
 */
export function getSecondaryDominants(
  root: string,
  scaleType: ScaleType,
  complexity: Complexity
): ChordInfo[] {
  const diatonic = getDiatonicChords(root, scaleType, complexity);

  return diatonic.map((chord, idx) => {
    const secDomSymbol = getSecondaryDominant(chord.root);
    const { notes, intervals, displayIntervals } = resolveChordNotes(secDomSymbol);

    return {
      symbol: secDomSymbol,
      root: secDomSymbol.replace(/7$/, ''),
      name: `V7/${chord.romanNumeral}`,
      romanNumeral: `V7/${chord.romanNumeral}`,
      degree: idx + 1,
      function: 'dominant' as const,
      notes,
      intervals,
      displayIntervals,
      isSecondaryDominant: true,
      secondaryDominantTarget: chord.romanNumeral,
    };
  });
}

/**
 * Suggest passing chords between two chords (with actual notes populated)
 */
export function suggestPassingChords(
  fromChord: ChordInfo,
  toChord: ChordInfo
): ChordInfo[] {
  const suggestions: ChordInfo[] = [];

  const toRoot = toChord.root;

  // 1. Diminished approach: half-step below the target root
  const dimRoot = Note.transpose(toRoot, '-2m');
  if (dimRoot) {
    const dimRootName = dimRoot.replace(/\d+$/, '');
    const dimSymbol = `${dimRootName}dim7`;
    const { notes, intervals, displayIntervals } = resolveChordNotes(dimSymbol);
    suggestions.push({
      symbol: dimSymbol,
      root: dimRootName,
      name: `${dimRootName} diminished 7th (approach)`,
      romanNumeral: `#${romanDegreeLabel(fromChord.degree)}°7`,
      degree: 0,
      function: 'dominant',
      notes,
      intervals,
      displayIntervals,
    });
  }

  // 2. Tritone substitution
  const tritoneRoot = Note.transpose(toRoot, '5d');
  if (tritoneRoot) {
    const tritoneRootName = tritoneRoot.replace(/\d+$/, '');
    const triSymbol = `${tritoneRootName}7`;
    const { notes, intervals, displayIntervals } = resolveChordNotes(triSymbol);
    suggestions.push({
      symbol: triSymbol,
      root: tritoneRootName,
      name: `${tritoneRootName}7 (tritone sub)`,
      romanNumeral: `bII7`,
      degree: 0,
      function: 'dominant',
      notes,
      intervals,
      displayIntervals,
    });
  }

  return suggestions;
}

function romanDegreeLabel(degree: number): string {
  const labels = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  return labels[degree - 1] || `${degree}`;
}
