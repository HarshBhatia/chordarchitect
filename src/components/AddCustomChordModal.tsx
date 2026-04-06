import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Modal } from 'react-native';
import { Text } from 'react-native-paper';
import { Icon } from './Icon';
import { designTokens } from '../theme';
import { useHarmonyStore } from '../store/useHarmonyStore';
import { Chord } from 'tonal';
import type { ChordInfo } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const ROOT_NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

const CHORD_TYPES = [
  { label: 'Major', value: 'M' },
  { label: 'Minor', value: 'm' },
  { label: 'Maj 7', value: 'maj7' },
  { label: 'Min 7', value: 'm7' },
  { label: 'Dom 7', value: '7' },
  { label: 'Dim', value: 'dim' },
  { label: 'Half Dim', value: 'm7b5' },
  { label: 'Aug', value: 'aug' },
  { label: 'Sus 2', value: 'sus2' },
  { label: 'Sus 4', value: 'sus4' },
  { label: 'Add 9', value: 'add9' },
  { label: 'Min 9', value: 'm9' },
  { label: 'Maj 9', value: 'maj9' },
  { label: 'Dom 9', value: '9' },
];

export function AddCustomChordModal({ visible, onClose }: Props) {
  const addToProgression = useHarmonyStore(s => s.addToProgression);
  
  const [selectedRoot, setSelectedRoot] = useState('C');
  const [selectedType, setSelectedType] = useState('M');

  // Preview generated notes
  const chordSymbol = `${selectedRoot}${selectedType}`;
  const tonalData = Chord.get(chordSymbol);
  
  const handleAdd = () => {
    if (!tonalData || tonalData.empty) return;
    // Map Tonal.Chord to our ChordInfo model
    const customChordInfo: ChordInfo = {
      root: selectedRoot,
      symbol: chordSymbol,
      name: tonalData.name,
      romanNumeral: chordSymbol,
      degree: -1,
      function: 'subdominant',
      notes: tonalData.notes,
      intervals: tonalData.intervals,
      displayIntervals: tonalData.intervals, // Tonal string intervals are fine
      complexity: 2,
    };
    
    addToProgression(customChordInfo);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text variant="titleMedium" style={styles.title}>Add Custom Chord</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={16} color="rgba(255,255,255,0.7)" />
            </Pressable>
          </View>

          <View style={styles.previewBox}>
            <Text style={styles.previewSymbol}>{chordSymbol}</Text>
            <Text style={styles.previewNotes}>
              {!tonalData.empty ? tonalData.notes.join(' - ') : 'Invalid Chord'}
            </Text>
          </View>

          <Text variant="labelSmall" style={styles.pickerLabel}>ROOT NOTE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pickerRow}>
            {ROOT_NOTES.map(note => (
              <Pressable
                key={`rn-${note}`}
                style={[styles.pill, selectedRoot === note && styles.pillActive]}
                onPress={() => setSelectedRoot(note)}
              >
                <Text style={[styles.pillText, selectedRoot === note && styles.pillTextActive]}>
                  {note}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text variant="labelSmall" style={styles.pickerLabel}>CHORD TYPE</Text>
          <View style={styles.gridPicker}>
            {CHORD_TYPES.map(type => (
              <Pressable
                key={`ct-${type.value}`}
                style={[styles.gridItem, selectedType === type.value && styles.gridItemActive]}
                onPress={() => setSelectedType(type.value)}
              >
                <Text style={[styles.gridItemText, selectedType === type.value && styles.gridItemTextActive]}>
                  {type.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable 
            style={[styles.actionBtn, tonalData.empty && styles.actionBtnDisabled]} 
            disabled={tonalData.empty}
            onPress={handleAdd}
          >
            <Text style={styles.actionBtnText}>Add To Progression</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1E212B',
    borderRadius: designTokens.borderRadiusLg,
    borderWidth: 1,
    borderColor: '#2A2F3D',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  previewBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: 16,
    borderRadius: designTokens.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 24,
  },
  previewSymbol: {
    fontSize: 24,
    fontWeight: '800',
    color: '#34D399',
  },
  previewNotes: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  pickerLabel: {
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
    marginBottom: 8,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pillActive: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderColor: 'rgba(52, 211, 153, 0.4)',
  },
  pillText: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    fontSize: 14,
  },
  pillTextActive: {
    color: '#34D399',
  },
  gridPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  gridItem: {
    width: '31%', // roughly 3 cols
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  gridItemActive: {
    backgroundColor: 'rgba(108, 142, 255, 0.15)',
    borderColor: 'rgba(108, 142, 255, 0.4)',
  },
  gridItemText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '500',
  },
  gridItemTextActive: {
    color: '#6C8EFF',
  },
  actionBtn: {
    backgroundColor: '#6C8EFF',
    paddingVertical: 14,
    borderRadius: designTokens.borderRadius,
    alignItems: 'center',
    marginTop: 8,
  },
  actionBtnDisabled: {
    backgroundColor: 'rgba(108, 142, 255, 0.3)',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
