/**
 * Progression Builder — horizontal timeline of selected chords with reordering
 */

import React from 'react';
import { ScrollView, StyleSheet, Pressable, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useHarmonyStore } from '../store/useHarmonyStore';
import { FUNCTION_COLORS } from '../engine/constants';
import { designTokens } from '../theme';
import { ProgressionTemplates } from './ProgressionTemplates';

export function ProgressionBuilder() {
  const progression = useHarmonyStore(s => s.progression);
  const removeFromProgression = useHarmonyStore(s => s.removeFromProgression);
  const moveInProgression = useHarmonyStore(s => s.moveInProgression);
  const clearProgression = useHarmonyStore(s => s.clearProgression);
  const selectChord = useHarmonyStore(s => s.selectChord);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="labelSmall" style={styles.label}>PROGRESSION</Text>
        {progression.length > 0 && (
          <Pressable style={styles.clearBtn} onPress={clearProgression}>
            <Ionicons name="trash-outline" size={12} color="rgba(255,255,255,0.4)" />
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        )}
      </View>

      <ProgressionTemplates />

      {progression.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="musical-notes-outline" size={28} color="rgba(255,255,255,0.15)" />
          <Text style={styles.emptyText}>
            Tap + on chords above or select a template to build a progression
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.progressionScroll}
        >
          {progression.map((chord, idx) => {
            const color = FUNCTION_COLORS[chord.function];
            const isLast = idx === progression.length - 1;

            return (
              <React.Fragment key={`prog-${idx}`}>
                <View style={styles.chordItem}>
                  {/* Move controls */}
                  <View style={styles.moveControls}>
                    {idx > 0 && (
                      <Pressable
                        onPress={() => moveInProgression(idx, idx - 1)}
                        style={styles.moveBtn}
                      >
                        <Ionicons name="chevron-back" size={10} color="rgba(255,255,255,0.3)" />
                      </Pressable>
                    )}
                  </View>

                  <Pressable
                    style={[styles.progCard, { borderLeftColor: color }]}
                    onPress={() => selectChord(chord)}
                  >
                    <Text style={[styles.progNumeral, { color }]}>
                      {chord.romanNumeral}
                    </Text>
                    <Text style={styles.progSymbol}>{chord.symbol}</Text>
                    <Pressable
                      style={styles.removeBtn}
                      onPress={() => removeFromProgression(idx)}
                    >
                      <Ionicons name="close" size={10} color="rgba(255,255,255,0.3)" />
                    </Pressable>
                  </Pressable>

                  <View style={styles.moveControls}>
                    {idx < progression.length - 1 && (
                      <Pressable
                        onPress={() => moveInProgression(idx, idx + 1)}
                        style={styles.moveBtn}
                      >
                        <Ionicons name="chevron-forward" size={10} color="rgba(255,255,255,0.3)" />
                      </Pressable>
                    )}
                  </View>
                </View>

                {/* Arrow between chords */}
                {!isLast && (
                  <View style={styles.arrow}>
                    <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.12)" />
                  </View>
                )}
              </React.Fragment>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: designTokens.glass,
    borderRadius: designTokens.borderRadiusLg,
    borderWidth: 1,
    borderColor: designTokens.glassBorder,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.5,
    fontSize: 10,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(248, 113, 113, 0.08)',
  },
  clearText: {
    color: 'rgba(248, 113, 113, 0.6)',
    fontSize: 10,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 280,
  },
  progressionScroll: {
    gap: 0,
    alignItems: 'center',
    paddingVertical: 4,
  },
  chordItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moveControls: {
    width: 16,
    alignItems: 'center',
  },
  moveBtn: {
    padding: 4,
  },
  progCard: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderLeftWidth: 3,
    alignItems: 'center',
    minWidth: 72,
    gap: 2,
  },
  progNumeral: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  progSymbol: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  removeBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  arrow: {
    paddingHorizontal: 4,
  },
});
