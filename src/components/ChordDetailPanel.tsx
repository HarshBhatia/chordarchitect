/**
 * Chord Detail Panel — interval legend + chord info, responsive
 */

import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { useHarmonyStore } from '../store/useHarmonyStore';
import { FUNCTION_COLORS, INTERVAL_COLORS } from '../engine/constants';
import { designTokens } from '../theme';

export function ChordDetailPanel() {
  const selectedChord = useHarmonyStore(s => s.selectedChord);
  const { width } = useWindowDimensions();
  const isNarrow = width < 480;

  if (!selectedChord) return null;

  const color = FUNCTION_COLORS[selectedChord.function];
  const funcLabel =
    selectedChord.function === 'tonic' ? 'Tonic' :
    selectedChord.function === 'subdominant' ? 'Subdominant' :
    'Dominant';

  return (
    <View style={styles.container}>
      <View style={[styles.row, isNarrow && styles.rowNarrow]}>
        {/* Left: Chord identity */}
        <View style={styles.identity}>
          <Text style={[styles.symbol, { color }]}>{selectedChord.symbol}</Text>
          <Text style={styles.name}>{selectedChord.name}</Text>
        </View>

        {/* Function badge */}
        <View style={[styles.funcBadge, { backgroundColor: color + '18', borderColor: color + '30' }]}>
          <View style={[styles.funcIndicator, { backgroundColor: color }]} />
          <Text style={[styles.funcText, { color }]}>{funcLabel}</Text>
          <Text style={[styles.romanText, { color }]}>{selectedChord.romanNumeral}</Text>
        </View>

        {/* Notes with interval coloring */}
        <View style={[styles.details, isNarrow && styles.detailsNarrow]}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Notes</Text>
            <View style={styles.noteChips}>
              {selectedChord.notes.map((note, i) => {
                const interval = selectedChord.displayIntervals[i] || '';
                const noteColor = INTERVAL_COLORS[interval] || 'rgba(255,255,255,0.6)';
                return (
                  <View key={i} style={[styles.noteChip, { borderColor: noteColor + '40' }]}>
                    <Text style={[styles.noteValue, { color: noteColor }]}>{note}</Text>
                    <Text style={[styles.intervalBadge, { color: noteColor + '80' }]}>{interval}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E32', // surface_container
    borderRadius: designTokens.borderRadiusLg,
    borderWidth: 0,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  rowNarrow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  identity: {
    gap: 1,
  },
  symbol: {
    fontFamily: 'Manrope, sans-serif',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  name: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
  },
  funcBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 0,
    gap: 5,
  },
  funcIndicator: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  funcText: {
    fontSize: 10,
    fontWeight: '600',
  },
  romanText: {
    fontFamily: 'Space Grotesk, sans-serif',
    fontSize: 12,
    fontWeight: '800',
  },
  details: {
    flex: 1,
    minWidth: 130,
  },
  detailsNarrow: {
    width: '100%',
    flex: undefined,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  detailLabel: {
    fontFamily: 'Space Grotesk, sans-serif',
    color: '#958EA0',
    fontSize: 10,
    fontWeight: '600',
    width: 36,
    textTransform: 'uppercase',
  },
  noteChips: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  noteChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0,
    backgroundColor: '#333348', // surface_container_highest
  },
  noteValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  intervalBadge: {
    fontFamily: 'Space Grotesk, sans-serif',
    fontSize: 9,
    fontWeight: '600',
  },
});
