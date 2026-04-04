/**
 * Complexity Toggle — 3-position segmented control for chord depth
 */

import React from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useHarmonyStore } from '../store/useHarmonyStore';
import { designTokens } from '../theme';
import type { Complexity } from '../types';

const LEVELS: { value: Complexity; label: string; icon: string }[] = [
  { value: 1, label: 'Triads', icon: 'musical-notes-outline' },
  { value: 2, label: '7ths', icon: 'musical-notes' },
  { value: 3, label: '9/11/13', icon: 'sparkles' },
];

export function ComplexityToggle() {
  const complexity = useHarmonyStore(s => s.complexity);
  const setComplexity = useHarmonyStore(s => s.setComplexity);

  return (
    <View style={styles.container}>
      <Text variant="labelSmall" style={styles.label}>DEPTH</Text>
      <View style={styles.track}>
        {LEVELS.map(level => {
          const isActive = complexity === level.value;
          return (
            <Pressable
              key={level.value}
              style={[styles.segment, isActive && styles.segmentActive]}
              onPress={() => setComplexity(level.value)}
            >
              <Ionicons
                name={level.icon as any}
                size={14}
                color={isActive ? '#6C8EFF' : 'rgba(255,255,255,0.35)'}
              />
              <Text
                variant="labelSmall"
                style={[styles.segmentText, isActive && styles.segmentTextActive]}
              >
                {level.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 12,
  },
  label: {
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 6,
    marginLeft: 4,
    letterSpacing: 1.5,
    fontSize: 10,
  },
  track: {
    flexDirection: 'row',
    backgroundColor: designTokens.glass,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: designTokens.glassBorder,
    padding: 3,
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 17,
    gap: 5,
  },
  segmentActive: {
    backgroundColor: 'rgba(108, 142, 255, 0.15)',
  },
  segmentText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '500',
  },
  segmentTextActive: {
    color: '#6C8EFF',
    fontWeight: '700',
  },
});
