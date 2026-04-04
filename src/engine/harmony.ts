/**
 * Harmony engine — functional harmony, roman numerals, progression resolution
 */

import { Note } from 'tonal';
import type { ChordInfo, Complexity, ScaleType } from '../types';
import { PROGRESSION_TEMPLATES } from './constants';
import { getDiatonicChords, getSecondaryDominant } from './chords';

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

    return {
      symbol: secDomSymbol,
      root: secDomSymbol.replace(/7$/, ''),
      name: `V7/${chord.romanNumeral}`,
      romanNumeral: `V7/${chord.romanNumeral}`,
      degree: idx + 1,
      function: 'dominant' as const,
      notes: [],
      intervals: [],
      displayIntervals: [],
      isSecondaryDominant: true,
      secondaryDominantTarget: chord.romanNumeral,
    };
  });
}

/**
 * Suggest passing chords between two chords
 */
export function suggestPassingChords(
  fromChord: ChordInfo,
  toChord: ChordInfo
): ChordInfo[] {
  const suggestions: ChordInfo[] = [];

  // 1. Diminished approach: half-step below the target root
  const fromRoot = fromChord.root;
  const toRoot = toChord.root;

  // Chromatic approach from below
  const dimRoot = Note.transpose(toRoot, '-2m');
  if (dimRoot) {
    const dimRootName = dimRoot.replace(/\d+$/, '');
    suggestions.push({
      symbol: `${dimRootName}dim7`,
      root: dimRootName,
      name: `${dimRootName} diminished 7th (approach)`,
      romanNumeral: `#${romanDegreeLabel(fromChord.degree)}°7`,
      degree: 0,
      function: 'dominant',
      notes: [],
      intervals: [],
      displayIntervals: [],
    });
  }

  // 2. Tritone substitution
  const tritoneRoot = Note.transpose(toRoot, '5d');
  if (tritoneRoot) {
    const tritoneRootName = tritoneRoot.replace(/\d+$/, '');
    suggestions.push({
      symbol: `${tritoneRootName}7`,
      root: tritoneRootName,
      name: `${tritoneRootName}7 (tritone sub)`,
      romanNumeral: `bII7`,
      degree: 0,
      function: 'dominant',
      notes: [],
      intervals: [],
      displayIntervals: [],
    });
  }

  return suggestions;
}

function romanDegreeLabel(degree: number): string {
  const labels = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  return labels[degree - 1] || `${degree}`;
}
