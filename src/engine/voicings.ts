/**
 * Voicing engine — generates guitar and piano voicings
 */

import { Note } from 'tonal';
import type { FretMarker, GuitarVoicing, KeyMarker } from '../types';
import { GUITAR_STRING_NOTES, FRET_COUNT, INTERVAL_DISPLAY } from './constants';

/**
 * Note name to semitone value (C=0)
 */
function noteToSemitone(noteName: string): number {
  const map: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1,
    'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'Fb': 4,
    'F': 5, 'E#': 5, 'F#': 6, 'Gb': 6,
    'G': 7, 'G#': 8, 'Ab': 8,
    'A': 9, 'A#': 10, 'Bb': 10,
    'B': 11, 'Cb': 11,
  };
  // Strip octave number
  const name = noteName.replace(/\d+$/, '');
  return map[name] ?? 0;
}

/**
 * Get the note at a specific string and fret
 */
export function getNoteAtPosition(stringIndex: number, fret: number): string {
  const openNote = GUITAR_STRING_NOTES[stringIndex];
  const openSemitone = noteToSemitone(openNote);
  const semitone = (openSemitone + fret) % 12;

  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return names[semitone];
}

/**
 * Find the interval between a chord root and a note
 */
function getIntervalFromRoot(root: string, note: string): string {
  const rootSemitone = noteToSemitone(root);
  const noteSemitone = noteToSemitone(note);
  const diff = ((noteSemitone - rootSemitone) + 12) % 12;

  const intervalMap: Record<number, string> = {
    0: '1P', 1: '2m', 2: '2M', 3: '3m', 4: '3M',
    5: '4P', 6: '5d', 7: '5P', 8: '6m', 9: '6M',
    10: '7m', 11: '7M',
  };

  return intervalMap[diff] || '1P';
}

/**
 * Get all fretboard markers for a set of chord notes
 */
export function getFretboardMarkers(
  chordNotes: string[],
  chordRoot: string
): FretMarker[] {
  const markers: FretMarker[] = [];

  for (let stringIdx = 0; stringIdx < 6; stringIdx++) {
    for (let fret = 0; fret <= FRET_COUNT; fret++) {
      const noteAtPosition = getNoteAtPosition(stringIdx, fret);
      const isChordNote = chordNotes.some(cn => {
        const cnName = cn.replace(/\d+$/, '');
        return noteToSemitone(cnName) === noteToSemitone(noteAtPosition);
      });

      if (isChordNote) {
        const interval = getIntervalFromRoot(chordRoot, noteAtPosition);
        markers.push({
          string: stringIdx,
          fret,
          note: noteAtPosition,
          interval,
          displayInterval: INTERVAL_DISPLAY[interval] || interval,
          isRoot: noteToSemitone(noteAtPosition) === noteToSemitone(chordRoot),
        });
      }
    }
  }

  return markers;
}

/**
 * Get a common guitar voicing for a chord
 * Returns a curated shape based on known chord types
 */
export function getGuitarVoicing(chordSymbol: string): GuitarVoicing {
  // Common chord voicing database (open and barre shapes)
  const voicings: Record<string, GuitarVoicing> = {
    // Major open chords
    'C': { frets: [-1, 3, 2, 0, 1, 0], baseFret: 1, label: 'Open C' },
    'D': { frets: [-1, -1, 0, 2, 3, 2], baseFret: 1, label: 'Open D' },
    'E': { frets: [0, 2, 2, 1, 0, 0], baseFret: 1, label: 'Open E' },
    'F': { frets: [1, 3, 3, 2, 1, 1], baseFret: 1, label: 'Barre F' },
    'G': { frets: [3, 2, 0, 0, 0, 3], baseFret: 1, label: 'Open G' },
    'A': { frets: [-1, 0, 2, 2, 2, 0], baseFret: 1, label: 'Open A' },
    'B': { frets: [-1, 2, 4, 4, 4, 2], baseFret: 1, label: 'Barre B' },

    // Minor open chords
    'Am': { frets: [-1, 0, 2, 2, 1, 0], baseFret: 1, label: 'Open Am' },
    'Dm': { frets: [-1, -1, 0, 2, 3, 1], baseFret: 1, label: 'Open Dm' },
    'Em': { frets: [0, 2, 2, 0, 0, 0], baseFret: 1, label: 'Open Em' },
    'Fm': { frets: [1, 3, 3, 1, 1, 1], baseFret: 1, label: 'Barre Fm' },

    // 7th chords
    'C7': { frets: [-1, 3, 2, 3, 1, 0], baseFret: 1, label: 'C7' },
    'D7': { frets: [-1, -1, 0, 2, 1, 2], baseFret: 1, label: 'D7' },
    'E7': { frets: [0, 2, 0, 1, 0, 0], baseFret: 1, label: 'E7' },
    'G7': { frets: [3, 2, 0, 0, 0, 1], baseFret: 1, label: 'G7' },
    'A7': { frets: [-1, 0, 2, 0, 2, 0], baseFret: 1, label: 'A7' },
    'B7': { frets: [-1, 2, 1, 2, 0, 2], baseFret: 1, label: 'B7' },

    // Major 7ths
    'Cmaj7': { frets: [-1, 3, 2, 0, 0, 0], baseFret: 1, label: 'Cmaj7' },
    'Dmaj7': { frets: [-1, -1, 0, 2, 2, 2], baseFret: 1, label: 'Dmaj7' },
    'Fmaj7': { frets: [1, -1, 2, 2, 1, 0], baseFret: 1, label: 'Fmaj7' },
    'Gmaj7': { frets: [3, 2, 0, 0, 0, 2], baseFret: 1, label: 'Gmaj7' },
    'Amaj7': { frets: [-1, 0, 2, 1, 2, 0], baseFret: 1, label: 'Amaj7' },

    // Minor 7ths
    'Am7': { frets: [-1, 0, 2, 0, 1, 0], baseFret: 1, label: 'Am7' },
    'Dm7': { frets: [-1, -1, 0, 2, 1, 1], baseFret: 1, label: 'Dm7' },
    'Em7': { frets: [0, 2, 0, 0, 0, 0], baseFret: 1, label: 'Em7' },
    'Bm7': { frets: [-1, 2, 0, 2, 0, 2], baseFret: 1, label: 'Bm7' },
  };

  return voicings[chordSymbol] || {
    frets: [-1, -1, -1, -1, -1, -1],
    baseFret: 1,
    label: chordSymbol,
  };
}

/**
 * Get piano key markers for a set of chord notes
 */
export function getPianoKeyMarkers(
  chordNotes: string[],
  chordRoot: string,
  octaveStart: number = 3,
  octaveEnd: number = 5,
): KeyMarker[] {
  const markers: KeyMarker[] = [];
  const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const blackKeys = new Set([1, 3, 6, 8, 10]); // semitone indices of black keys

  for (let octave = octaveStart; octave <= octaveEnd; octave++) {
    for (let i = 0; i < 12; i++) {
      const note = allNotes[i];
      const fullNote = `${note}${octave}`;
      const midi = Note.midi(fullNote);

      const isChordNote = chordNotes.some(cn => {
        const cnName = cn.replace(/\d+$/, '');
        return noteToSemitone(cnName) === noteToSemitone(note);
      });

      if (isChordNote && midi !== null) {
        const interval = getIntervalFromRoot(chordRoot, note);
        markers.push({
          midiNote: midi,
          note,
          octave,
          interval,
          displayInterval: INTERVAL_DISPLAY[interval] || interval,
          isRoot: noteToSemitone(note) === noteToSemitone(chordRoot),
          isBlackKey: blackKeys.has(i),
        });
      }
    }
  }

  return markers;
}
