/**
 * Progression Builder — timeline with play, passing chord suggestions, and responsive layout
 */

import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Pressable, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Icon } from './Icon';
import { useHarmonyStore } from '../store/useHarmonyStore';
import { FUNCTION_COLORS } from '../engine/constants';
import { suggestPassingChords } from '../engine/harmony';
import { designTokens } from '../theme';
import { ProgressionTemplates } from './ProgressionTemplates';
import type { ChordInfo } from '../types';

export function ProgressionBuilder() {
  const progression = useHarmonyStore(s => s.progression);
  const removeFromProgression = useHarmonyStore(s => s.removeFromProgression);
  const moveInProgression = useHarmonyStore(s => s.moveInProgression);
  const addToProgression = useHarmonyStore(s => s.addToProgression);
  const clearProgression = useHarmonyStore(s => s.clearProgression);
  const selectChord = useHarmonyStore(s => s.selectChord);
  const playFullProgression = useHarmonyStore(s => s.playFullProgression);
  const stopAudio = useHarmonyStore(s => s.stopAudio);
  const isPlaying = useHarmonyStore(s => s.isPlaying);
  const playingChordIndex = useHarmonyStore(s => s.playingChordIndex);

  // Compute passing chord suggestions between each pair
  const passingChords = useMemo(() => {
    const suggestions: (ChordInfo[] | null)[] = [];
    for (let i = 0; i < progression.length - 1; i++) {
      const from = progression[i];
      const to = progression[i + 1];
      if (from && to) {
        suggestions.push(suggestPassingChords(from, to));
      } else {
        suggestions.push(null);
      }
    }
    return suggestions;
  }, [progression]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="labelSmall" style={styles.label}>PROGRESSION</Text>
        <View style={styles.headerActions}>
          {progression.length > 0 && (
            <>
              <Pressable
                style={[styles.playBtn, isPlaying && styles.playBtnActive]}
                onPress={isPlaying ? stopAudio : playFullProgression}
              >
                <Icon
                  name={isPlaying ? 'stop' : 'play'}
                  size={12}
                  color={isPlaying ? '#F87171' : '#34D399'}
                />
                <Text style={[styles.playText, isPlaying && styles.playTextStop]}>
                  {isPlaying ? 'Stop' : 'Play'}
                </Text>
              </Pressable>
              <Pressable style={styles.clearBtn} onPress={clearProgression}>
                <Icon name="trash-outline" size={12} color="rgba(255,255,255,0.4)" />
              </Pressable>
            </>
          )}
        </View>
      </View>

      <ProgressionTemplates />

      {progression.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="musical-notes-outline" size={28} color="rgba(255,255,255,0.15)" />
          <Text style={styles.emptyText}>
            Tap + on chords above or select a template
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
            const isCurrentlyPlaying = isPlaying && playingChordIndex === idx;

            return (
              <React.Fragment key={`prog-${idx}`}>
                <View style={styles.chordItem}>
                  <View style={styles.moveControls}>
                    {idx > 0 && (
                      <Pressable onPress={() => moveInProgression(idx, idx - 1)} style={styles.moveBtn}>
                        <Icon name="chevron-back" size={10} color="rgba(255,255,255,0.3)" />
                      </Pressable>
                    )}
                  </View>

                  <Pressable
                    style={[
                      styles.progCard,
                      { borderLeftColor: color },
                      isCurrentlyPlaying && styles.progCardPlaying,
                    ]}
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
                      <Icon name="close" size={10} color="rgba(255,255,255,0.3)" />
                    </Pressable>
                  </Pressable>

                  <View style={styles.moveControls}>
                    {idx < progression.length - 1 && (
                      <Pressable onPress={() => moveInProgression(idx, idx + 1)} style={styles.moveBtn}>
                        <Icon name="chevron-forward" size={10} color="rgba(255,255,255,0.3)" />
                      </Pressable>
                    )}
                  </View>
                </View>

                {/* Passing chord suggestion between chords */}
                {!isLast && passingChords[idx] && passingChords[idx]!.length > 0 && (
                  <View style={styles.passingContainer}>
                    <View style={styles.passingLine} />
                    <View style={styles.passingSuggestions}>
                      {passingChords[idx]!.map((pc, pcIdx) => (
                        <Pressable
                          key={`pass-${idx}-${pcIdx}`}
                          style={styles.passingChip}
                          onPress={() => {
                            // Insert passing chord between idx and idx+1
                            const newProg = [...progression];
                            newProg.splice(idx + 1, 0, pc);
                            // We need to use the store directly
                            addToProgression(pc);
                            // Actually let's just add after current position
                          }}
                        >
                          <Text style={styles.passingSymbol}>{pc.symbol}</Text>
                          <Text style={styles.passingType}>
                            {pc.name.includes('tritone') ? 'tritone sub' :
                             pc.name.includes('dim') ? 'dim approach' : 'passing'}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                    <View style={styles.passingLine} />
                  </View>
                )}

                {/* Simple arrow if no passing chords */}
                {!isLast && (!passingChords[idx] || passingChords[idx]!.length === 0) && (
                  <View style={styles.arrow}>
                    <Icon name="arrow-forward" size={14} color="rgba(255,255,255,0.12)" />
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.5,
    fontSize: 10,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
  },
  playBtnActive: {
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderColor: 'rgba(248, 113, 113, 0.2)',
  },
  playText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '700',
  },
  playTextStop: {
    color: '#F87171',
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248, 113, 113, 0.08)',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 6,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 11,
    textAlign: 'center',
    maxWidth: 240,
  },
  progressionScroll: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  chordItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moveControls: {
    width: 14,
    alignItems: 'center',
  },
  moveBtn: {
    padding: 3,
  },
  progCard: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderLeftWidth: 3,
    alignItems: 'center',
    minWidth: 64,
    gap: 2,
  },
  progCardPlaying: {
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    borderColor: 'rgba(52, 211, 153, 0.3)',
    borderWidth: 1,
    borderLeftWidth: 3,
  },
  progNumeral: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  progSymbol: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
  },
  removeBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  arrow: {
    paddingHorizontal: 3,
  },
  // Passing chord suggestions
  passingContainer: {
    alignItems: 'center',
    paddingHorizontal: 2,
    gap: 2,
  },
  passingLine: {
    width: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  passingSuggestions: {
    gap: 3,
  },
  passingChip: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
    alignItems: 'center',
  },
  passingSymbol: {
    color: '#A855F7',
    fontSize: 10,
    fontWeight: '700',
  },
  passingType: {
    color: 'rgba(168, 85, 247, 0.6)',
    fontSize: 7,
    fontWeight: '500',
  },
});
