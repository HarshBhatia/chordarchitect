/**
 * Scale engine — wraps tonal.js Scale module
 */

import { Scale } from 'tonal';
import type { ScaleType } from '../types';

/**
 * Get the notes of a scale given root and type
 */
export function getScaleNotes(root: string, scaleType: ScaleType): string[] {
  const scaleName = `${root} ${scaleType}`;
  const scale = Scale.get(scaleName);
  if (scale.empty) {
    // Fallback: try without space handling
    return [];
  }
  return scale.notes;
}

/**
 * Get the interval pattern of a scale
 */
export function getScaleIntervals(scaleType: ScaleType): string[] {
  const scaleName = `C ${scaleType}`;
  const scale = Scale.get(scaleName);
  return scale.intervals;
}

/**
 * Get the number of notes in a scale
 */
export function getScaleLength(scaleType: ScaleType): number {
  return getScaleIntervals(scaleType).length;
}

/**
 * Check if a note is in a given scale
 */
export function isNoteInScale(note: string, root: string, scaleType: ScaleType): boolean {
  const notes = getScaleNotes(root, scaleType);
  // Normalize for comparison (strip octave)
  const noteName = note.replace(/\d+$/, '');
  return notes.some(n => enharmonicEqual(n, noteName));
}

/**
 * Check if two notes are enharmonic equivalents
 */
export function enharmonicEqual(a: string, b: string): boolean {
  const normalize = (n: string) => {
    const map: Record<string, string> = {
      'C#': 'Db', 'Db': 'C#',
      'D#': 'Eb', 'Eb': 'D#',
      'F#': 'Gb', 'Gb': 'F#',
      'G#': 'Ab', 'Ab': 'G#',
      'A#': 'Bb', 'Bb': 'A#',
    };
    return [n, map[n] || n];
  };

  const aNorms = normalize(a);
  const bNorms = normalize(b);
  return aNorms.some(an => bNorms.includes(an));
}
