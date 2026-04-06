/**
 * ChordArchitect — Main Screen (responsive)
 */

import React from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions, Modal, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/src/components/Icon';

import { KeySelector } from '@/src/components/KeySelector';
import { ScaleSelector } from '@/src/components/ScaleSelector';
import { ComplexityToggle } from '@/src/components/ComplexityToggle';
import { InstrumentToggle } from '@/src/components/InstrumentToggle';
import { Fretboard } from '@/src/components/Fretboard';
import { PianoKeyboard } from '@/src/components/PianoKeyboard';
import { DiatonicPalette } from '@/src/components/DiatonicPalette';
import { ProgressionBuilder } from '@/src/components/ProgressionBuilder';
import { ChordDetailPanel } from '@/src/components/ChordDetailPanel';
import { PlaybackSettings } from '@/src/components/PlaybackSettings';
import { useHarmonyStore } from '@/src/store/useHarmonyStore';

export default function MainScreen() {
  const instrument = useHarmonyStore(s => s.instrument);
  const rootNote = useHarmonyStore(s => s.rootNote);
  const scaleType = useHarmonyStore(s => s.scaleType);
  const { width } = useWindowDimensions();
  const isWide = width > 768;
  const isNarrow = width < 768;

  const isSettingsOpen = useHarmonyStore(s => s.isSettingsOpen);
  const setIsSettingsOpen = useHarmonyStore(s => s.setIsSettingsOpen);

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
          <View style={styles.headerActions}>
            <Pressable style={styles.settingsBtn} onPress={() => setIsSettingsOpen(true)}>
              <Icon name="options" size={20} color="rgba(255,255,255,0.7)" />
              {!isNarrow && <Text style={styles.settingsText}>Settings</Text>}
            </Pressable>
          </View>
        </View>

        {/* ─── Settings Modal / Overlay ─── */}
        <Modal
          visible={isSettingsOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsSettingsOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalContent, isWide && styles.modalContentWide]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Sandbox Options</Text>
                <Pressable onPress={() => setIsSettingsOpen(false)} style={styles.closeBtn}>
                  <Icon name="close" size={24} color="rgba(255,255,255,0.6)" />
                </Pressable>
              </View>
              
              <ScrollView style={styles.selectorsSection} contentContainerStyle={{ gap: 16, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
                <KeySelector />
                <ScaleSelector />
                <InstrumentToggle />
                <ComplexityToggle />
                <PlaybackSettings />
              </ScrollView>
              
              <Pressable style={styles.doneBtn} onPress={() => setIsSettingsOpen(false)}>
                <Text style={styles.doneBtnText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* ─── Current Key Display ─── */}
        <View style={styles.keyDisplay}>
          <Text style={styles.keyDisplayText}>
            {rootNote} {scaleType.charAt(0).toUpperCase() + scaleType.slice(1)}
          </Text>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#44E2CD' }]} />
              <Text style={styles.legendText}>Tonic</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FFB95F' }]} />
              <Text style={styles.legendText}>Subdominant</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FFB4AB' }]} />
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
  },
  titleBlock: {
    gap: 0,
  },
  appTitle: {
    fontFamily: 'Manrope, sans-serif',
    fontSize: 28,
    fontWeight: '800',
    color: '#E2E0FC',
    letterSpacing: -0.5,
  },
  appTitleNarrow: {
    fontSize: 24,
  },
  appSubtitle: {
    fontFamily: 'Manrope, sans-serif',
    fontSize: 14,
    color: '#D0BCFF',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  settingsText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E1E32',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 20,
    maxHeight: '90%',
  },
  modalContentWide: {
    alignSelf: 'center',
    width: 600,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  closeBtn: {
    padding: 4,
  },
  doneBtn: {
    backgroundColor: '#D0BCFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  doneBtnText: {
    color: '#3C0091',
    fontSize: 16,
    fontWeight: '700',
  },
  selectorsSection: {
    flexShrink: 1,
  },
  keyDisplay: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  keyDisplayText: {
    fontFamily: 'Manrope, sans-serif',
    fontSize: 18,
    fontWeight: '700',
    color: '#E2E0FC',
  },
  legendRow: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontFamily: 'Space Grotesk, sans-serif',
    fontSize: 11,
    color: '#958EA0',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  visualizerSection: {
    overflow: 'hidden',
  },
});
