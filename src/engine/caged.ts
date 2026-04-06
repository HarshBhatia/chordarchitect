import { GuitarVoicing } from '../types';

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
  const name = noteName.replace(/\d+$/, '');
  return map[name] ?? 0;
}

// Map standard root strings for CAGED bases:
// E shape: 6th string (index 0, open E)
// A shape: 5th string (index 1, open A)
// D shape: 4th string (index 2, open D)
// C shape: 5th string (index 1, open A) - root at fret 3
// G shape: 6th string (index 0, open E) - root at fret 3
const CAGED_ROOT_OFFSETS: Record<string, number> = {
  'E': 4,  // E is 4 semitones from C
  'A': 9,  // A is 9 semitones from C
  'D': 2,  // D is 2 semitones from C
  'C': 0,
  'G': 7,
};

const CAGED_TEMPLATES: Record<string, Record<string, number[]>> = {
  'major': {
    'E': [0, 2, 2, 1, 0, 0],   
    'A': [-1, 0, 2, 2, 2, 0],  
    'D': [-1, -1, 0, 2, 3, 2], 
    'C': [-1, 3, 2, 0, 1, 0],  
    'G': [3, 2, 0, 0, 0, 3],   
  },
  'minor': {
    'E': [0, 2, 2, 0, 0, 0],
    'A': [-1, 0, 2, 2, 1, 0],
    'D': [-1, -1, 0, 2, 3, 1],
    'C': [-1, 3, 1, 0, 1, -1],
    'G': [3, 1, 0, 0, -1, -1],
  },
  '7': {
    'E': [0, 2, 0, 1, 0, 0],
    'A': [-1, 0, 2, 0, 2, 0],
    'D': [-1, -1, 0, 2, 1, 2],
    'C': [-1, 3, 2, 3, 1, 0],
    'G': [3, 2, 0, 0, 0, 1],
  },
  'maj7': {
    'E': [0, 2, 1, 1, 0, 0],
    'A': [-1, 0, 2, 1, 2, 0],
    'D': [-1, -1, 0, 2, 2, 2],
    'C': [-1, 3, 2, 0, 0, 0],
    'G': [3, 2, 0, 0, 0, 2],
  },
  'm7': {
    'E': [0, 2, 0, 0, 0, 0],
    'A': [-1, 0, 2, 0, 1, 0],
    'D': [-1, -1, 0, 2, 1, 1],
    'C': [-1, 3, 1, 3, 1, -1],
    'G': [3, 5, 3, 3, 3, 3],
  },
  'm7b5': {
    'E': [0, 1, 0, 0, -1, -1],
    'A': [-1, 0, 1, 0, 1, -1],
    'D': [-1, -1, 0, 1, 1, 1],
    'C': [-1, 3, 4, 3, 4, -1],
    'G': [3, 4, 3, 3, -1, -1],
  },
  'dim7': {
    'E': [0, 1, 2, 0, -1, -1],
    'A': [-1, 0, 1, 2, 1, -1],
    'D': [-1, -1, 0, 1, 0, 1],
    'C': [-1, 3, 4, 2, 4, -1],
    'G': [3, 4, 2, 3, -1, -1],
  },
  'dim': {
    'E': [0, 1, 2, -1, -1, -1],
    'A': [-1, 0, 1, 2, -1, -1],
    'D': [-1, -1, 0, 1, 3, -1],
    'C': [-1, 3, 4, 5, -1, -1],
    'G': [3, 4, 5, -1, -1, -1],
  },
  'sus2': {
    'E': [0, 2, 4, 1, 0, 0],
    'A': [-1, 0, 2, 2, 0, 0],
    'D': [-1, -1, 0, 2, 3, 0],
    'C': [-1, 3, 0, 0, 1, -1],
    'G': [3, 0, 0, 0, 3, 3],
  },
  'sus4': {
    'E': [0, 2, 2, 2, 0, 0],
    'A': [-1, 0, 2, 2, 3, 0],
    'D': [-1, -1, 0, 2, 3, 3],
    'C': [-1, 3, 3, 0, 1, 1],
    'G': [3, 3, 0, 0, 1, 3],
  },
  'aug': {
    'E': [0, 3, 2, 1, -1, -1],
    'A': [-1, 0, 3, 2, 2, -1],
    'D': [-1, -1, 0, 3, 3, 2],
    'C': [-1, 3, 2, 1, 1, -1],
    'G': [3, 2, 1, 0, -1, -1],
  }
};

/**
 * Extracts root and quality from a standard chord symbol and maps it to a standard CAGED dictionary key.
 */
function parseChord(symbol: string) {
  const match = symbol.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return { root: 'C', quality: 'major' };
  
  let root = match[1];
  let rawQuality = match[2];

  let quality = 'major';
  if (rawQuality === 'm' || rawQuality === 'min') quality = 'minor';
  else if (rawQuality === '7' || rawQuality === 'dom7') quality = '7';
  else if (rawQuality === 'maj7' || rawQuality === 'M7') quality = 'maj7';
  else if (rawQuality === 'm7' || rawQuality === 'min7') quality = 'm7';
  else if (rawQuality === 'm7b5' || rawQuality === 'ø') quality = 'm7b5';
  else if (rawQuality === 'dim7' || rawQuality === '°7') quality = 'dim7';
  else if (rawQuality === 'dim' || rawQuality === '°') quality = 'dim';
  else if (rawQuality === 'sus2') quality = 'sus2';
  else if (rawQuality === 'sus4') quality = 'sus4';
  else if (rawQuality === 'aug' || rawQuality === '+') quality = 'aug';

  return { root, quality };
}

export function generateCAGEDVoicings(chordSymbol: string): GuitarVoicing[] {
  const { root, quality } = parseChord(chordSymbol);
  const targetSemitone = noteToSemitone(root);
  const voicings: GuitarVoicing[] = [];
  
  const templateMap = CAGED_TEMPLATES[quality];
  if (!templateMap) return [];

  const shapes = ['E', 'A', 'D', 'C', 'G'];
  
  shapes.forEach(shape => {
    const baseFrets = templateMap[shape];
    const shapeRootSemitone = CAGED_ROOT_OFFSETS[shape];
    
    // Shift required to map the shape's root to the target root
    let shift = (targetSemitone - shapeRootSemitone) % 12;
    if (shift < 0) shift += 12;

    // Filter out shapes that require extreme shifts that don't fit perfectly 
    // unless they can be played with open strings
    if (shift === 0) {
      voicings.push({
        frets: [...baseFrets],
        baseFret: 1,
        label: `${shape} Form (Open)`,
      });
    } else {
      // Shift barre chord
      const shiftedFrets = baseFrets.map(f => f < 0 ? -1 : f + shift);
      // Valid if it's not unplayable (spanning way too many strings impossibly wide without a barre setup)
      // Usually CAGED translates standard open forms into barres directly.
      voicings.push({
        frets: shiftedFrets,
        baseFret: Math.max(1, shift),
        label: `${shape} Form (${shift}fr)`,
      });
    }
  });

  return voicings;
}
