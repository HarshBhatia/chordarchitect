/**
 * Key Selector — horizontal pill selector for root notes
 */

import React from 'react';
import { ScrollView, StyleSheet, Pressable, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useHarmonyStore } from '../store/useHarmonyStore';
import { SELECTABLE_ROOTS } from '../engine/constants';
import { designTokens } from '../theme';

export function KeySelector() {
  const rootNote = useHarmonyStore(s => s.rootNote);
  const setRootNote = useHarmonyStore(s => s.setRootNote);

  return (
    <View style={styles.container}>
      <Text variant="labelSmall" style={styles.label}>KEY</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {SELECTABLE_ROOTS.map(note => {
          const isActive = note === rootNote;
          return (
            <Pressable
              key={note}
              onPress={() => setRootNote(note)}
              style={[styles.pill, isActive && styles.pillActive]}
            >
              <Text
                variant="labelLarge"
                style={[styles.pillText, isActive && styles.pillTextActive]}
              >
                {note}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  label: {
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 6,
    marginLeft: 4,
    letterSpacing: 1.5,
    fontSize: 10,
  },
  scrollContent: {
    gap: 6,
    paddingHorizontal: 2,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: designTokens.glass,
    borderWidth: 1,
    borderColor: designTokens.glassBorder,
  },
  pillActive: {
    backgroundColor: 'rgba(108, 142, 255, 0.2)',
    borderColor: '#6C8EFF',
  },
  pillText: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  pillTextActive: {
    color: '#6C8EFF',
    fontWeight: '700',
  },
});
