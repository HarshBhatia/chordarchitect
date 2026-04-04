/**
 * Chord Detail Panel — shows detailed information about the selected chord
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useHarmonyStore } from '../store/useHarmonyStore';
import { FUNCTION_COLORS } from '../engine/constants';
import { designTokens } from '../theme';

export function ChordDetailPanel() {
  const selectedChord = useHarmonyStore(s => s.selectedChord);

  if (!selectedChord) return null;

  const color = FUNCTION_COLORS[selectedChord.function];
  const funcLabel =
    selectedChord.function === 'tonic' ? 'Tonic' :
    selectedChord.function === 'subdominant' ? 'Subdominant' :
    'Dominant';

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Left: Chord identity */}
        <View style={styles.identity}>
          <Text style={[styles.symbol, { color }]}>{selectedChord.symbol}</Text>
          <Text style={styles.name}>{selectedChord.name}</Text>
        </View>

        {/* Center: Function badge */}
        <View style={[styles.funcBadge, { backgroundColor: color + '18', borderColor: color + '30' }]}>
          <View style={[styles.funcIndicator, { backgroundColor: color }]} />
          <Text style={[styles.funcText, { color }]}>{funcLabel}</Text>
          <Text style={[styles.romanText, { color }]}>{selectedChord.romanNumeral}</Text>
        </View>

        {/* Right: Notes and intervals */}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Notes</Text>
            <Text style={styles.detailValue}>{selectedChord.notes.join(' · ')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Intervals</Text>
            <Text style={styles.detailValue}>{selectedChord.displayIntervals.join(' · ')}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: designTokens.glass,
    borderRadius: designTokens.borderRadius,
    borderWidth: 1,
    borderColor: designTokens.glassBorder,
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  identity: {
    gap: 2,
    minWidth: 100,
  },
  symbol: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  name: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
  },
  funcBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  funcIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  funcText: {
    fontSize: 11,
    fontWeight: '600',
  },
  romanText: {
    fontSize: 13,
    fontWeight: '800',
  },
  details: {
    flex: 1,
    gap: 4,
    minWidth: 140,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontWeight: '500',
    width: 48,
  },
  detailValue: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
