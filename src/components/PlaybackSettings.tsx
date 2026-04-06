import React from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Icon } from './Icon';
import { useHarmonyStore } from '../store/useHarmonyStore';

export function PlaybackSettings() {
  const metronomeEnabled = useHarmonyStore(s => s.metronomeEnabled);
  const toggleMetronome = useHarmonyStore(s => s.toggleMetronome);
  const looping = useHarmonyStore(s => s.looping);
  const toggleLooping = useHarmonyStore(s => s.toggleLooping);
  const playStyle = useHarmonyStore(s => s.playStyle);
  const setPlayStyle = useHarmonyStore(s => s.setPlayStyle);
  const synthType = useHarmonyStore(s => s.synthType);
  const setSynthType = useHarmonyStore(s => s.setSynthType);
  const baseOctave = useHarmonyStore(s => s.baseOctave);
  const setBaseOctave = useHarmonyStore(s => s.setBaseOctave);
  const metronomeVolume = useHarmonyStore(s => s.metronomeVolume);
  const setMetronomeVolume = useHarmonyStore(s => s.setMetronomeVolume);

  return (
    <View style={styles.container}>
      <View style={styles.sectionCard}>
        <Text variant="labelSmall" style={styles.sectionHeader}>ENGINE BEHAVIOR</Text>
        
        <Text variant="labelSmall" style={styles.label}>PLAYBACK CONTROLS</Text>
        <View style={styles.track}>
          <Pressable
            style={[styles.segment, playStyle === 'chord' && styles.segmentActive]}
            onPress={() => setPlayStyle('chord')}
          >
            <Icon name="apps" size={14} color={playStyle === 'chord' ? '#D0BCFF' : 'rgba(255,255,255,0.4)'} />
            <Text style={[styles.segmentText, playStyle === 'chord' && styles.segmentTextActive]}>
              Block
            </Text>
          </Pressable>

          <Pressable
            style={[styles.segment, playStyle === 'arpeggio' && styles.segmentActive]}
            onPress={() => setPlayStyle('arpeggio')}
          >
            <Icon name="musical-notes" size={14} color={playStyle === 'arpeggio' ? '#D0BCFF' : 'rgba(255,255,255,0.4)'} />
            <Text style={[styles.segmentText, playStyle === 'arpeggio' && styles.segmentTextActive]}>
              Arp
            </Text>
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            style={[styles.segment, looping && styles.segmentActive]}
            onPress={toggleLooping}
          >
            <Icon name="repeat" size={14} color={looping ? '#D0BCFF' : 'rgba(255,255,255,0.4)'} />
            <Text style={[styles.segmentText, looping && styles.segmentTextActive]}>
              Loop
            </Text>
          </Pressable>

          <Pressable
            style={[styles.segment, metronomeEnabled && styles.segmentActive]}
            onPress={toggleMetronome}
          >
            <Icon name="time" size={14} color={metronomeEnabled ? '#D0BCFF' : 'rgba(255,255,255,0.4)'} />
            <Text style={[styles.segmentText, metronomeEnabled && styles.segmentTextActive]}>
              Metronome
            </Text>
          </Pressable>
        </View>

        <Text variant="labelSmall" style={[styles.label, { marginTop: 16 }]}>CLICK VOLUME</Text>
        <View style={styles.track}>
          <Pressable
            style={[styles.segment, metronomeVolume === -20 && styles.segmentActive]}
            onPress={() => setMetronomeVolume(-20)}
          >
            <Text style={[styles.segmentText, metronomeVolume === -20 && styles.segmentTextActive]}>
              Soft (-20dB)
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segment, metronomeVolume === -10 && styles.segmentActive]}
            onPress={() => setMetronomeVolume(-10)}
          >
            <Text style={[styles.segmentText, metronomeVolume === -10 && styles.segmentTextActive]}>
              Mid (-10dB)
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segment, metronomeVolume === 0 && styles.segmentActive]}
            onPress={() => setMetronomeVolume(0)}
          >
            <Text style={[styles.segmentText, metronomeVolume === 0 && styles.segmentTextActive]}>
              Loud (0dB)
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text variant="labelSmall" style={styles.sectionHeader}>SOUND DESIGN</Text>
        
        <Text variant="labelSmall" style={styles.label}>SYNTHESIS</Text>
        <View style={styles.track}>
          <Pressable
            style={[styles.segment, synthType === 'sine' && styles.segmentActive]}
            onPress={() => setSynthType('sine')}
          >
            <Text style={[styles.segmentText, synthType === 'sine' && styles.segmentTextActive]}>
              Sine Preset
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segment, synthType === 'sawtooth' && styles.segmentActive]}
            onPress={() => setSynthType('sawtooth')}
          >
            <Text style={[styles.segmentText, synthType === 'sawtooth' && styles.segmentTextActive]}>
              Saw Preset
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segment, synthType === 'square' && styles.segmentActive]}
            onPress={() => setSynthType('square')}
          >
            <Text style={[styles.segmentText, synthType === 'square' && styles.segmentTextActive]}>
              Square Preset
            </Text>
          </Pressable>
        </View>

        <Text variant="labelSmall" style={[styles.label, { marginTop: 16 }]}>OCTAVE BASE</Text>
        <View style={styles.track}>
          <Pressable
            style={[styles.segment, baseOctave === 5 && styles.segmentActive]}
            onPress={() => setBaseOctave(5)}
          >
            <Text style={[styles.segmentText, baseOctave === 5 && styles.segmentTextActive]}>
              Octave +1 (High)
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segment, baseOctave === 4 && styles.segmentActive]}
            onPress={() => setBaseOctave(4)}
          >
            <Text style={[styles.segmentText, baseOctave === 4 && styles.segmentTextActive]}>
              Octave 0 (Mid)
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segment, baseOctave === 3 && styles.segmentActive]}
            onPress={() => setBaseOctave(3)}
          >
            <Text style={[styles.segmentText, baseOctave === 3 && styles.segmentTextActive]}>
              Octave -1 (Low)
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: 4,
  },
  sectionCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sectionHeader: {
    fontFamily: 'Space Grotesk, sans-serif',
    color: '#D0BCFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(208, 188, 255, 0.2)',
    paddingBottom: 6,
  },
  label: {
    fontFamily: 'Space Grotesk, sans-serif',
    color: '#958EA0',
    fontSize: 10,
    marginBottom: 6,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  track: {
    flexDirection: 'row',
    backgroundColor: '#111125', // surface_dim 
    borderRadius: 8,
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  segmentActive: {
    backgroundColor: '#252542', // elevated
  },
  segmentText: {
    color: '#958EA0',
    fontSize: 11,
    fontWeight: '500',
  },
  segmentTextActive: {
    color: '#E8DEF8',
    fontWeight: '700',
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 4,
  }
});
