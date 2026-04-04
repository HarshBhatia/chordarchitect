/**
 * Instrument Toggle — switch between Guitar and Piano views
 */

import React from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useHarmonyStore } from '../store/useHarmonyStore';
import { designTokens } from '../theme';

export function InstrumentToggle() {
  const instrument = useHarmonyStore(s => s.instrument);
  const setInstrument = useHarmonyStore(s => s.setInstrument);
  const showIntervals = useHarmonyStore(s => s.showIntervals);
  const toggleIntervals = useHarmonyStore(s => s.toggleIntervals);

  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.toggleBtn, instrument === 'guitar' && styles.toggleBtnActive]}
          onPress={() => setInstrument('guitar')}
        >
          <Text style={[styles.emoji, instrument === 'guitar' && styles.emojiActive]}>🎸</Text>
          <Text
            variant="labelSmall"
            style={[styles.toggleText, instrument === 'guitar' && styles.toggleTextActive]}
          >
            Guitar
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggleBtn, instrument === 'piano' && styles.toggleBtnActive]}
          onPress={() => setInstrument('piano')}
        >
          <Text style={[styles.emoji, instrument === 'piano' && styles.emojiActive]}>🎹</Text>
          <Text
            variant="labelSmall"
            style={[styles.toggleText, instrument === 'piano' && styles.toggleTextActive]}
          >
            Piano
          </Text>
        </Pressable>
      </View>
      <Pressable
        style={[styles.intervalBtn, showIntervals && styles.intervalBtnActive]}
        onPress={toggleIntervals}
      >
        <Ionicons
          name="swap-horizontal"
          size={14}
          color={showIntervals ? '#34D399' : 'rgba(255,255,255,0.4)'}
        />
        <Text
          variant="labelSmall"
          style={[styles.intervalText, showIntervals && styles.intervalTextActive]}
        >
          {showIntervals ? 'Intervals' : 'Notes'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: designTokens.glass,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: designTokens.glassBorder,
    padding: 3,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 17,
    gap: 5,
  },
  toggleBtnActive: {
    backgroundColor: 'rgba(108, 142, 255, 0.15)',
  },
  emoji: {
    fontSize: 14,
    opacity: 0.5,
  },
  emojiActive: {
    opacity: 1,
  },
  toggleText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#6C8EFF',
    fontWeight: '700',
  },
  intervalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: designTokens.glass,
    borderWidth: 1,
    borderColor: designTokens.glassBorder,
    gap: 4,
  },
  intervalBtnActive: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  intervalText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
  },
  intervalTextActive: {
    color: '#34D399',
    fontWeight: '600',
  },
});
