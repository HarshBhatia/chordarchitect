/**
 * Progression Builder — timeline with play, passing chord suggestions, and responsive layout
 */

import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Pressable, View } from 'react-native';
import { Text, Tooltip } from 'react-native-paper';
import { Icon } from './Icon';
import { useHarmonyStore } from '../store/useHarmonyStore';
import { FUNCTION_COLORS } from '../engine/constants';
import { suggestPassingChords } from '../engine/harmony';
import { EditChordModal } from './EditChordModal';
import { designTokens } from '../theme';
import { downloadMidi } from '../engine/midi';
import type { ChordInfo } from '../types';

export function ProgressionBuilder() {
  const [editingChordIndex, setEditingChordIndex] = useState<number | null>(null);
  const [expandedPassingIdx, setExpandedPassingIdx] = useState<number | null>(null);
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
  const insertInProgression = useHarmonyStore(s => s.insertInProgression);
  const bpm = useHarmonyStore(s => s.bpm);
  const setBpm = useHarmonyStore(s => s.setBpm);

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
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
          <Text variant="labelSmall" style={styles.label}>PROGRESSION</Text>
          <Text style={styles.lengthBadge}>{progression.length}/16</Text>
        </View>
        <View style={styles.headerActions}>
          {progression.length > 0 && (
            <>
              <View style={styles.tempoControls}>
                <Pressable style={styles.bpmBtn} onPress={() => setBpm(Math.max(40, bpm - 10))}>
                  <Text style={styles.bpmBtnText}>-</Text>
                </Pressable>
                <Text style={styles.bpmText}>{bpm} BPM</Text>
                <Pressable style={styles.bpmBtn} onPress={() => setBpm(Math.min(200, bpm + 10))}>
                  <Text style={styles.bpmBtnText}>+</Text>
                </Pressable>
              </View>

              <Pressable
                style={[styles.playBtn, isPlaying ? styles.playBtnStop : styles.playBtnStart]}
                onPress={isPlaying ? stopAudio : playFullProgression}
              >
                <Icon
                  name={isPlaying ? 'stop' : 'play'}
                  size={12}
                  color={isPlaying ? '#FFB4AB' : '#3C0091'}
                />
                <Text style={[styles.playText, isPlaying ? styles.playBtnTextStop : styles.playBtnTextPlay]}>
                  {isPlaying ? 'Stop' : 'Play'}
                </Text>
              </Pressable>

              <Tooltip title="Download MIDI">
                <Pressable style={styles.clearBtn} onPress={() => {
                  downloadMidi(progression, bpm);
                }}>
                  <Icon name="download-outline" size={12} color="rgba(255,255,255,0.4)" />
                </Pressable>
              </Tooltip>

              <Tooltip title="Clear Progression">
                <Pressable style={styles.clearBtn} onPress={clearProgression}>
                  <Icon name="trash-outline" size={12} color="rgba(255,255,255,0.4)" />
                </Pressable>
              </Tooltip>
            </>
          )}
        </View>
      </View>

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
                      isCurrentlyPlaying && { 
                        backgroundColor: '#333348',
                        boxShadow: `0 0 16px ${color}`
                      },
                    ]}
                    onPress={() => selectChord(chord)}
                    onLongPress={() => setEditingChordIndex(idx)}
                    delayLongPress={300}
                  >
                    <Text style={[styles.progNumeral, { color }]}>
                      {chord.romanNumeral}
                    </Text>
                    <Text style={styles.progSymbol}>{chord.symbol}</Text>
                    
                    <View style={styles.cardActions}>
                      <Pressable style={styles.actionBtn} onPress={() => removeFromProgression(idx)}>
                        <Icon name="close" size={10} color="rgba(255,255,255,0.7)" />
                      </Pressable>
                    </View>
                  </Pressable>

                  <View style={styles.moveControls}>
                    {idx < progression.length - 1 && (
                      <Pressable onPress={() => moveInProgression(idx, idx + 1)} style={styles.moveBtn}>
                        <Icon name="chevron-forward" size={10} color="rgba(255,255,255,0.3)" />
                      </Pressable>
                    )}
                  </View>
                </View>

                {/* Expandable Passing Chord Suggestion Segment */}
                {!isLast && (
                  <View style={styles.arrow}>
                    {expandedPassingIdx === idx && passingChords[idx] && passingChords[idx]!.length > 0 ? (
                      <View style={styles.passingContainer}>
                        <View style={styles.passingSuggestions}>
                          {passingChords[idx]!.map((pc, pcIdx) => (
                            <Pressable
                              key={`pass-${idx}-${pcIdx}`}
                              style={styles.passingChip}
                              onPress={() => {
                                insertInProgression(pc, idx);
                                setExpandedPassingIdx(null);
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
                        <Pressable onPress={() => setExpandedPassingIdx(null)} style={{marginTop: 4}}>
                          <Icon name="chevron-forward" size={14} color="rgba(255,255,255,0.3)" />
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable 
                        style={styles.passingToggleCell} 
                        onPress={() => passingChords[idx] && passingChords[idx]!.length > 0 ? setExpandedPassingIdx(idx) : null}
                      >
                        <Icon 
                           name={passingChords[idx] && passingChords[idx]!.length > 0 ? "add" : "chevron-forward"} 
                           size={passingChords[idx] && passingChords[idx]!.length > 0 ? 12 : 14} 
                           color="rgba(255,255,255,0.15)" 
                        />
                      </Pressable>
                    )}
                  </View>
                )}
              </React.Fragment>
            );
          })}
        </ScrollView>
      )}
      
      {editingChordIndex !== null && (
        <EditChordModal 
          chordIndex={editingChordIndex} 
          onClose={() => setEditingChordIndex(null)} 
        />
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
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    color: '#8a8f98',
    letterSpacing: 1,
    fontWeight: '700',
  },
  lengthBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#8a8f98',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  playBtnStart: {
    backgroundColor: '#D0BCFF',
    boxShadow: '0 0 12px rgba(208, 188, 255, 0.4)',
  },
  playBtnStop: {
    backgroundColor: 'rgba(255, 180, 171, 0.2)',
  },
  playText: {
    fontSize: 10,
  },
  playBtnTextPlay: {
    color: '#3C0091',
    fontWeight: '700',
  },
  playBtnTextStop: {
    color: '#FFB4AB',
    fontWeight: '600',
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  btnActive: {
    backgroundColor: 'rgba(108, 142, 255, 0.15)',
  },
  tempoControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    paddingHorizontal: 2,
  },
  bpmBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  bpmBtnText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '600',
  },
  bpmText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '600',
    minWidth: 46,
    textAlign: 'center',
  },
  loopBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  loopBtnActive: {
    backgroundColor: 'rgba(108, 142, 255, 0.15)',
    borderColor: 'rgba(108, 142, 255, 0.3)',
    borderWidth: 1,
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
    paddingTop: 26,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderRadius: designTokens.borderRadiusLg,
    backgroundColor: '#1A1A2E', // surface_container_low
    position: 'relative',
    minWidth: 76,
    alignItems: 'center',
    gap: 4,
  },
  progCardPlaying: {
  },
  progNumeral: {
    fontFamily: 'Space Grotesk, sans-serif',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  progSymbol: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  cardActions: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  passingToggleCell: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
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
