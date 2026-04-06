/**
 * Instrument Toggle — switch between Guitar and Piano views
 */

import React from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Icon } from './Icon';
import { useHarmonyStore } from '../store/useHarmonyStore';
import { designTokens } from '../theme';

export function InstrumentToggle() {
  const instrument = useHarmonyStore(s => s.instrument);
  const setInstrument = useHarmonyStore(s => s.setInstrument);
  const showIntervals = useHarmonyStore(s => s.showIntervals);
  const toggleIntervals = useHarmonyStore(s => s.toggleIntervals);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text variant="labelSmall" style={styles.label}>INSTRUMENT</Text>
        <View style={styles.track}>
          <Pressable
            style={[styles.segment, instrument === 'guitar' && styles.segmentActive]}
            onPress={() => setInstrument('guitar')}
          >
            <Text
              style={[styles.segmentText, instrument === 'guitar' && styles.segmentTextActive]}
            >
              Guitar
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segment, instrument === 'piano' && styles.segmentActive]}
            onPress={() => setInstrument('piano')}
          >
            <Text
              style={[styles.segmentText, instrument === 'piano' && styles.segmentTextActive]}
            >
              Piano
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="labelSmall" style={styles.label}>NOTATION</Text>
        <View style={styles.track}>
          <Pressable
            style={[styles.segment, !showIntervals && styles.segmentActive]}
            onPress={() => showIntervals && toggleIntervals()}
          >
            <Text style={[styles.segmentText, !showIntervals && styles.segmentTextActive]}>
              Notes (A, B, C)
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segment, showIntervals && styles.segmentActive]}
            onPress={() => !showIntervals && toggleIntervals()}
          >
            <Text style={[styles.segmentText, showIntervals && styles.segmentTextActive]}>
              Degrees (I, III, V)
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  section: {
    // container for label + track
  },
  label: {
    fontFamily: 'Space Grotesk, sans-serif',
    color: '#958EA0',
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 1,
  },
  track: {
    flexDirection: 'row',
    backgroundColor: '#111125', // surface_dim 
    borderRadius: 16,
    padding: 4,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  segmentActive: {
    backgroundColor: '#1E1E32', // surface_container
  },
  segmentText: {
    color: '#958EA0',
    fontSize: 13,
    fontWeight: '500',
  },
  segmentTextActive: {
    color: '#D0BCFF',
    fontWeight: '700',
  },
});
