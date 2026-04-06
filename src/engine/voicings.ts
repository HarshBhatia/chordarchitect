/**
 * Voicing engine — generates guitar and piano voicings
 */

import { Note, Interval } from 'tonal';
import type { FretMarker, GuitarVoicing, KeyMarker } from '../types';
import { generateCAGEDVoicings } from './caged';
import { GUITAR_STRING_NOTES, GUITAR_TUNING, FRET_COUNT, INTERVAL_DISPLAY } from './constants';

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
  const cagedShapes = generateCAGEDVoicings(chordSymbol);
  if (cagedShapes.length > 0) return cagedShapes;

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
 * Get exact scientific pitches for a specific guitar voicing (e.g. ['E2', 'G#3'])
 */
export function getVoicingPitches(
  frets: number[],
  tuning: readonly string[] = GUITAR_TUNING
): string[] {
  const pitches: string[] = [];
  frets.forEach((fret, stringIdx) => {
    if (fret < 0) return;
    // visual to logical tuning mapping (string 0 is High E (E4), string 5 is Low E (E2))
    const logicalStringIdx = 5 - stringIdx;
    const openPitch = tuning[logicalStringIdx];
    const pitch = Note.transpose(openPitch, Interval.fromSemitones(fret));
    if (pitch) pitches.push(pitch);
  });
  // Return sorted from lowest to highest pitch
  return pitches.sort((a, b) => (Note.midi(a) || 0) - (Note.midi(b) || 0));
}

/**
 * Calculates the average played fret for a guitar voicing to determine its position.
 */
function getAverageFret(frets: number[]): number {
  const activeFrets = frets.filter(f => f > 0); // Exclude open strings and muted strings to find hand center
  if (activeFrets.length === 0) return 0;
  return activeFrets.reduce((sum, f) => sum + f, 0) / activeFrets.length;
}

/**
 * Finds the index of the voicing for `nextChord` that requires the least fret hand movement from the current voicing.
 */
export function getClosestVoicingIndex(
  currentSymbol: string,
  currentVoicingIndex: number,
  nextSymbol: string
): number {
  const currentVoicings = getGuitarVoicings(currentSymbol);
  const nextVoicings = getGuitarVoicings(nextSymbol);

  if (!currentVoicings[currentVoicingIndex] || nextVoicings.length === 0) return 0;

  const currentCenter = getAverageFret(currentVoicings[currentVoicingIndex].frets);
  
  let bestIndex = 0;
  let minDistance = Infinity;

  nextVoicings.forEach((v, idx) => {
    const center = getAverageFret(v.frets);
    const distance = Math.abs(currentCenter - center);
    if (distance < minDistance) {
      minDistance = distance;
      bestIndex = idx;
    }
  });

  return bestIndex;
}

/**
 * Get exact scientific pitches for a specific piano inversion
 */
export function getPianoInversionPitches(
  chordNotes: string[],
  inversion: 0 | 1 | 2 = 0,
  baseOctave: number = 3
): string[] {
  // Sort notes to start from root logically
  const rootNoteName = chordNotes[0];
  const rootMidiBase = Note.midi(`${rootNoteName}0`) || 0;
  
  let basePitches = chordNotes.map(n => {
    // Find shortest distance up from root
    const nMidiBase = Note.midi(`${n}0`) || 0;
    let dist = nMidiBase - rootMidiBase;
    if (dist < 0) dist += 12; // always stack up
    const octave = baseOctave + Math.floor(dist / 12);
    return `${n}${octave}`;
  });

  // Apply inversions by popping bottom notes and shifting them an octave up
  for (let i = 0; i < inversion; i++) {
    if (basePitches.length > 0) {
      const bottom = basePitches.shift()!;
      // transpose octave up
      const transposed = Note.transpose(bottom, '8P');
      if (transposed) basePitches.push(transposed);
    }
  }

  // sort low to high
  return basePitches.sort((a, b) => (Note.midi(a) || 0) - (Note.midi(b) || 0));
}

/**
 * Get piano key markers for a set of pitches
 */
export function getPianoKeyMarkers(
  activePitches: string[],
  chordRoot: string,
  octaveStart: number = 3,
  octaveEnd: number = 5,
): KeyMarker[] {
  const markers: KeyMarker[] = [];
  const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const blackKeys = new Set([1, 3, 6, 8, 10]); // semitone indices of black keys
  
  const activeMidis = new Set(activePitches.map(p => Note.midi(p)).filter(m => m !== null));

  for (let octave = octaveStart; octave <= octaveEnd; octave++) {
    for (let i = 0; i < 12; i++) {
      const note = allNotes[i];
      const fullNote = `${note}${octave}`;
      const midi = Note.midi(fullNote);

      if (midi !== null && activeMidis.has(midi)) {
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

