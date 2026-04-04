/**
 * ChordArchitect — Main Screen (responsive)
 */

import React from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KeySelector } from '@/src/components/KeySelector';
import { ScaleSelector } from '@/src/components/ScaleSelector';
import { ComplexityToggle } from '@/src/components/ComplexityToggle';
import { InstrumentToggle } from '@/src/components/InstrumentToggle';
import { Fretboard } from '@/src/components/Fretboard';
import { PianoKeyboard } from '@/src/components/PianoKeyboard';
import { DiatonicPalette } from '@/src/components/DiatonicPalette';
import { ProgressionBuilder } from '@/src/components/ProgressionBuilder';
import { ChordDetailPanel } from '@/src/components/ChordDetailPanel';
import { useHarmonyStore } from '@/src/store/useHarmonyStore';

export default function MainScreen() {
  const instrument = useHarmonyStore(s => s.instrument);
  const rootNote = useHarmonyStore(s => s.rootNote);
  const scaleType = useHarmonyStore(s => s.scaleType);
  const { width } = useWindowDimensions();
  const isWide = width > 768;
  const isNarrow = width < 480;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          isWide && styles.contentWide,
          isNarrow && styles.contentNarrow,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header ─── */}
        <View style={[styles.headerRow, isNarrow && styles.headerRowNarrow]}>
          <View style={styles.titleBlock}>
            <Text style={[styles.appTitle, isNarrow && styles.appTitleNarrow]}>
              ChordArchitect
            </Text>
            <Text style={styles.appSubtitle}>Harmonic Sandbox</Text>
          </View>
          <InstrumentToggle />
        </View>

        {/* ─── Selectors ─── */}
        <View style={styles.selectorsSection}>
          <KeySelector />
          <View style={[styles.scaleComplexityRow, isNarrow && styles.scaleComplexityRowNarrow]}>
            <ScaleSelector />
            <ComplexityToggle />
          </View>
        </View>

        {/* ─── Current Key Display ─── */}
        <View style={styles.keyDisplay}>
          <Text style={styles.keyDisplayText}>
            {rootNote} {scaleType.charAt(0).toUpperCase() + scaleType.slice(1)}
          </Text>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4A9EFF' }]} />
              <Text style={styles.legendText}>Tonic</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#34D399' }]} />
              <Text style={styles.legendText}>Subdominant</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F87171' }]} />
              <Text style={styles.legendText}>Dominant</Text>
            </View>
          </View>
        </View>

        {/* ─── Visualizer ─── */}
        <View style={styles.visualizerSection}>
          {instrument === 'guitar' ? <Fretboard /> : <PianoKeyboard />}
        </View>

        {/* ─── Chord Detail ─── */}
        <ChordDetailPanel />

        {/* ─── Diatonic Palette ─── */}
        <DiatonicPalette />

        {/* ─── Progression Builder ─── */}
        <ProgressionBuilder />

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  contentWide: {
    maxWidth: 960,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 32,
  },
  contentNarrow: {
    paddingHorizontal: 10,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  headerRowNarrow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  titleBlock: {
    gap: 0,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  appTitleNarrow: {
    fontSize: 20,
  },
  appSubtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  selectorsSection: {
    gap: 8,
  },
  scaleComplexityRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  scaleComplexityRowNarrow: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 8,
  },
  keyDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    flexWrap: 'wrap',
    gap: 6,
  },
  keyDisplayText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    fontWeight: '500',
  },
  visualizerSection: {
    // overflow scroll on narrow screens
    overflow: 'hidden',
  },
});
