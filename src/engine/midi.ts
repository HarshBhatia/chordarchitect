// @ts-ignore
import MidiWriter from 'midi-writer-js';
import type { ChordInfo } from '../types';

export function downloadMidi(progression: ChordInfo[], bpm: number) {
  if (progression.length === 0) return;

  const track = new MidiWriter.Track();
  track.setTempo(bpm);
  track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1 })); // Acoustic Grand Piano

  // Assuming each chord plays for 1 full measure (4 beats) 
  // since timeSignature is default 4/4 and each progression block currently fills the whole bar.
  progression.forEach(chord => {
    // Generate the 2-octave pitch spread we use in the synth
    const octave3 = chord.notes.map(n => `${n}3`);
    const octave4 = chord.notes.map(n => `${n}4`);
    const pitches = [...octave3, ...octave4];

    // MidiWriter expects pitches like ['C4', 'E4', 'G4']
    const noteEvent = new MidiWriter.NoteEvent({
      pitch: pitches,
      duration: '1', // '1' is a whole note (1 bar in 4/4)
      velocity: 80,
    });
    track.addEvent(noteEvent);
  });

  const write = new MidiWriter.Writer(track);
  const dataUri = write.dataUri();
  
  // Trigger browser download via invisible anchor tag
  const link = document.createElement('a');
  link.href = dataUri;
  link.download = 'ChordArchitect_Progression.mid';
  link.click();
}
