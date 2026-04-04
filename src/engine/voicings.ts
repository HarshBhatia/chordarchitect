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
 * Get multiple guitar voicings for a chord
 * Returns curated shapes + auto-generated position shapes
 */
export function getGuitarVoicings(chordSymbol: string): GuitarVoicing[] {
  // Common chord voicing database — multiple voicings per chord
  const voicingDb: Record<string, GuitarVoicing[]> = {
    'C':     [
      { frets: [-1, 3, 2, 0, 1, 0], baseFret: 1, label: 'Open' },
      { frets: [8, 10, 10, 9, 8, 8], baseFret: 8, label: 'Barre 8th' },
    ],
    'D':     [
      { frets: [-1, -1, 0, 2, 3, 2], baseFret: 1, label: 'Open' },
      { frets: [-1, 5, 7, 7, 7, 5], baseFret: 5, label: 'Barre 5th' },
    ],
    'E':     [
      { frets: [0, 2, 2, 1, 0, 0], baseFret: 1, label: 'Open' },
      { frets: [-1, 7, 9, 9, 9, 7], baseFret: 7, label: 'Barre 7th' },
    ],
    'F':     [
      { frets: [1, 3, 3, 2, 1, 1], baseFret: 1, label: 'Barre 1st' },
      { frets: [-1, -1, 3, 2, 1, 1], baseFret: 1, label: 'Partial' },
    ],
    'G':     [
      { frets: [3, 2, 0, 0, 0, 3], baseFret: 1, label: 'Open' },
      { frets: [3, 5, 5, 4, 3, 3], baseFret: 3, label: 'Barre 3rd' },
    ],
    'A':     [
      { frets: [-1, 0, 2, 2, 2, 0], baseFret: 1, label: 'Open' },
      { frets: [5, 7, 7, 6, 5, 5], baseFret: 5, label: 'Barre 5th' },
    ],
    'B':     [
      { frets: [-1, 2, 4, 4, 4, 2], baseFret: 2, label: 'Barre 2nd' },
      { frets: [7, 9, 9, 8, 7, 7], baseFret: 7, label: 'Barre 7th' },
    ],
    'Am':    [
      { frets: [-1, 0, 2, 2, 1, 0], baseFret: 1, label: 'Open' },
      { frets: [5, 7, 7, 5, 5, 5], baseFret: 5, label: 'Barre 5th' },
    ],
    'Dm':    [
      { frets: [-1, -1, 0, 2, 3, 1], baseFret: 1, label: 'Open' },
      { frets: [-1, 5, 7, 7, 6, 5], baseFret: 5, label: 'Barre 5th' },
    ],
    'Em':    [
      { frets: [0, 2, 2, 0, 0, 0], baseFret: 1, label: 'Open' },
      { frets: [-1, 7, 9, 9, 8, 7], baseFret: 7, label: 'Barre 7th' },
    ],
    'Fm':    [
      { frets: [1, 3, 3, 1, 1, 1], baseFret: 1, label: 'Barre 1st' },
    ],
    'Cmaj7': [
      { frets: [-1, 3, 2, 0, 0, 0], baseFret: 1, label: 'Open' },
      { frets: [8, 10, 9, 9, 8, -1], baseFret: 8, label: 'Pos 8' },
    ],
    'Dm7':   [
      { frets: [-1, -1, 0, 2, 1, 1], baseFret: 1, label: 'Open' },
      { frets: [-1, 5, 7, 5, 6, 5], baseFret: 5, label: 'Barre 5th' },
    ],
    'Em7':   [
      { frets: [0, 2, 0, 0, 0, 0], baseFret: 1, label: 'Open' },
      { frets: [0, 2, 2, 0, 3, 0], baseFret: 1, label: 'Open alt' },
    ],
    'Fmaj7': [
      { frets: [1, -1, 2, 2, 1, 0], baseFret: 1, label: 'Open' },
      { frets: [-1, -1, 3, 2, 1, 0], baseFret: 1, label: 'Partial' },
    ],
    'G7':    [
      { frets: [3, 2, 0, 0, 0, 1], baseFret: 1, label: 'Open' },
      { frets: [3, 5, 3, 4, 3, 3], baseFret: 3, label: 'Barre 3rd' },
    ],
    'Am7':   [
      { frets: [-1, 0, 2, 0, 1, 0], baseFret: 1, label: 'Open' },
      { frets: [5, 7, 5, 5, 5, 5], baseFret: 5, label: 'Barre 5th' },
    ],
    'Bm7b5': [
      { frets: [-1, 2, 3, 2, 3, -1], baseFret: 1, label: 'Pos 2' },
      { frets: [7, 8, 7, 7, -1, -1], baseFret: 7, label: 'Pos 7' },
    ],
    'C7':    [
      { frets: [-1, 3, 2, 3, 1, 0], baseFret: 1, label: 'Open' },
    ],
    'D7':    [
      { frets: [-1, -1, 0, 2, 1, 2], baseFret: 1, label: 'Open' },
    ],
    'E7':    [
      { frets: [0, 2, 0, 1, 0, 0], baseFret: 1, label: 'Open' },
    ],
    'A7':    [
      { frets: [-1, 0, 2, 0, 2, 0], baseFret: 1, label: 'Open' },
    ],
    'B7':    [
      { frets: [-1, 2, 1, 2, 0, 2], baseFret: 1, label: 'Open' },
    ],
    'Dmaj7': [
      { frets: [-1, -1, 0, 2, 2, 2], baseFret: 1, label: 'Open' },
    ],
    'Gmaj7': [
      { frets: [3, 2, 0, 0, 0, 2], baseFret: 1, label: 'Open' },
    ],
    'Amaj7': [
      { frets: [-1, 0, 2, 1, 2, 0], baseFret: 1, label: 'Open' },
    ],
    'Bm7':   [
      { frets: [-1, 2, 0, 2, 0, 2], baseFret: 1, label: 'Open' },
      { frets: [7, 9, 7, 7, 7, 7], baseFret: 7, label: 'Barre 7th' },
    ],
  };

  const shapes = voicingDb[chordSymbol];
  if (shapes && shapes.length > 0) return shapes;

  // Fallback: return a single "no voicing" shape
  return [{ frets: [-1, -1, -1, -1, -1, -1], baseFret: 1, label: chordSymbol }];
}

/**
 * Get markers for a specific voicing shape (only the notes in that shape)
 */
export function getVoicingMarkers(
  voicing: GuitarVoicing,
  chordRoot: string,
): FretMarker[] {
  const markers: FretMarker[] = [];

  voicing.frets.forEach((fret, stringIdx) => {
    if (fret < 0) return; // muted string

    const noteAtPosition = getNoteAtPosition(stringIdx, fret);
    const interval = getIntervalFromRoot(chordRoot, noteAtPosition);

    markers.push({
      string: stringIdx,
      fret,
      note: noteAtPosition,
      interval,
      displayInterval: INTERVAL_DISPLAY[interval] || interval,
      isRoot: noteToSemitone(noteAtPosition) === noteToSemitone(chordRoot),
    });
  });

  return markers;
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

