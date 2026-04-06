/**
 * Diatonic Palette — displays all chords in the current key with functional coloring
 */

import React from 'react';
import { ScrollView, StyleSheet, Pressable, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Icon } from './Icon';
import { useHarmonyStore } from '../store/useHarmonyStore';
import { FUNCTION_COLORS, FUNCTION_GLOW_COLORS } from '../engine/constants';
import { designTokens } from '../theme';
import type { ChordInfo } from '../types';
import { AddCustomChordModal } from './AddCustomChordModal';

export function DiatonicPalette() {
  const diatonicChords = useHarmonyStore(s => s.diatonicChords);
  const selectedChord = useHarmonyStore(s => s.selectedChord);
  const selectChord = useHarmonyStore(s => s.selectChord);
  const addToProgression = useHarmonyStore(s => s.addToProgression);
  const showSecondaryDominants = useHarmonyStore(s => s.showSecondaryDominants);
  const toggleSecondaryDominants = useHarmonyStore(s => s.toggleSecondaryDominants);
  const secondaryDominants = useHarmonyStore(s => s.secondaryDominants);

  const [isCustomModalOpen, setIsCustomModalOpen] = React.useState(false);

  const isSelected = (chord: ChordInfo) =>
    selectedChord?.symbol === chord.symbol && selectedChord?.degree === chord.degree;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="labelSmall" style={styles.label}>DIATONIC CHORDS</Text>
        <Pressable
          style={[styles.secDomBtn, showSecondaryDominants && styles.secDomBtnActive]}
          onPress={toggleSecondaryDominants}
        >
          <Text
            variant="labelSmall"
            style={[styles.secDomText, showSecondaryDominants && styles.secDomTextActive]}
          >
            V7/x
          </Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {diatonicChords.map((chord, idx) => {
          const color = FUNCTION_COLORS[chord.function];
          const glowColor = FUNCTION_GLOW_COLORS[chord.function];
          const selected = isSelected(chord);

          return (
            <View key={`chord-${idx}`} style={styles.chordColumn}>
              <Pressable
                style={[
                  styles.chordCard,
                  selected && { 
                    backgroundColor: '#333348', // surface_container_highest
                    boxShadow: `0 0 16px ${glowColor}`
                  },
                ]}
                onPress={() => selectChord(chord)}
              >
                {/* Function indicator dot */}
                <View style={[styles.funcDot, { backgroundColor: color }]} />

                {/* Roman numeral */}
                <Text style={[styles.romanNumeral, { color }]}>
                  {chord.romanNumeral}
                </Text>

                {/* Chord symbol */}
                <Text style={styles.chordSymbol} numberOfLines={1}>
                  {chord.symbol}
                </Text>

                {/* Notes */}
                <Text style={styles.chordNotes} numberOfLines={1}>
                  {chord.notes.slice(0, 4).join(' ')}
                </Text>

                {/* Add button */}
                <Pressable
                  style={styles.addBtn}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    addToProgression(chord);
                  }}
                >
                  <Icon name="add" size={14} color="rgba(255,255,255,0.5)" />
                </Pressable>
              </Pressable>

              {/* Secondary dominant */}
              {showSecondaryDominants && secondaryDominants[idx] && (
                <Pressable
                  style={styles.secDomCard}
                  onPress={() => selectChord(secondaryDominants[idx])}
                >
                  <Text style={styles.secDomLabel}>
                    {secondaryDominants[idx].romanNumeral}
                  </Text>
                  <Text style={styles.secDomSymbol}>
                    {secondaryDominants[idx].symbol}
                  </Text>
                </Pressable>
              )}
            </View>
          );
        })}

        {/* Custom Chord Button */}
        <View style={styles.chordColumn}>
          <Pressable
            style={[styles.chordCard, styles.customChordCard]}
            onPress={() => setIsCustomModalOpen(true)}
          >
            <View style={[styles.funcDot, { backgroundColor: 'transparent' }]} />
            <Text style={[styles.romanNumeral, { color: 'rgba(255,255,255,0.7)', fontSize: 24 }]}>
              +
            </Text>
            <Text style={styles.chordSymbol}>Custom</Text>
            <Text style={styles.chordNotes}>Borrowed</Text>
          </Pressable>
        </View>

      </ScrollView>

      {isCustomModalOpen && (
        <AddCustomChordModal visible={isCustomModalOpen} onClose={() => setIsCustomModalOpen(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontFamily: 'Space Grotesk, sans-serif',
    color: '#958EA0',
    letterSpacing: 1.5,
    fontSize: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  secDomBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: designTokens.glass,
    borderWidth: 1,
    borderColor: designTokens.glassBorder,
  },
  secDomBtnActive: {
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderColor: 'rgba(248, 113, 113, 0.3)',
  },
  secDomText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '600',
  },
  secDomTextActive: {
    color: '#F87171',
  },
  scrollContent: {
    gap: 8,
    paddingHorizontal: 2,
    paddingBottom: 4,
  },
  chordColumn: {
    alignItems: 'center',
    gap: 4,
  },
  chordCard: {
    width: 88,
    height: 132,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: designTokens.borderRadiusLg,
    backgroundColor: '#1A1A2E', // surface_container_low
    borderWidth: 0,
    alignItems: 'center',
    gap: 4,
  },
  customChordCard: {
    backgroundColor: '#1E1E32', // surface_container
  },
  funcDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 2,
  },
  romanNumeral: {
    fontFamily: 'Space Grotesk, sans-serif',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  chordSymbol: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    fontWeight: '600',
  },
  chordNotes: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  addBtn: {
    marginTop: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secDomCard: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(248, 113, 113, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.15)',
    alignItems: 'center',
    width: 80,
  },
  secDomLabel: {
    color: '#F87171',
    fontSize: 11,
    fontWeight: '700',
  },
  secDomSymbol: {
    color: 'rgba(248, 113, 113, 0.7)',
    fontSize: 13,
    fontWeight: '500',
  },
});
