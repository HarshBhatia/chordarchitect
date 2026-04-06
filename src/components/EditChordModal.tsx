import React from 'react';
import { StyleSheet, View, Text, Modal, Pressable, Platform } from 'react-native';
import { useHarmonyStore } from '../store/useHarmonyStore';
import { Icon } from './Icon';
import { designTokens } from '../theme';

interface EditChordModalProps {
  chordIndex: number;
  onClose: () => void;
}

export function EditChordModal({ chordIndex, onClose }: EditChordModalProps) {
  const progression = useHarmonyStore(s => s.progression);
  const instrument = useHarmonyStore(s => s.instrument);
  const updateChordInProgression = useHarmonyStore(s => s.updateChordInProgression);
  
  const chord = progression[chordIndex];
  if (!chord) return null;

  return (
    <Modal visible={true} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Edit Chord in Timeline</Text>
              <Text style={styles.subtitle}>{chord.romanNumeral} - {chord.symbol}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={24} color="#8a8f98" />
            </Pressable>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>Complexity (Depth)</Text>
            <View style={styles.segmentedControl}>
              {[ 
                { label: 'Triad', value: 1 }, 
                { label: '7th', value: 2 }, 
                { label: 'Ext', value: 3 } 
              ].map(opt => {
                const isActive = (chord.complexity || 2) === opt.value;
                return (
                  <Pressable
                    key={opt.label}
                    style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
                    onPress={() => updateChordInProgression(chordIndex, { complexity: opt.value as 1|2|3 })}
                  >
                    <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Suspension (Mod)</Text>
            <View style={styles.segmentedControl}>
              {[ 
                { label: 'None', value: undefined }, 
                { label: 'Sus2', value: 'sus2' }, 
                { label: 'Sus4', value: 'sus4' } 
              ].map(opt => {
                const isActive = chord.isSus === opt.value;
                return (
                  <Pressable
                    key={opt.label}
                    style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
                    onPress={() => updateChordInProgression(chordIndex, { isSus: opt.value as any })}
                  >
                    <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {instrument === 'piano' && (
              <>
                <Text style={styles.label}>Piano Inversion</Text>
                <View style={styles.segmentedControl}>
                  {[ 
                    { label: 'Root Base', value: 0 }, 
                    { label: '1st Inv', value: 1 }, 
                    { label: '2nd Inv', value: 2 } 
                  ].map(opt => {
                    const isActive = (chord.pianoInversion || 0) === opt.value;
                    return (
                      <Pressable
                        key={opt.label}
                        style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
                        onPress={() => updateChordInProgression(chordIndex, { pianoInversion: opt.value as 0|1|2 })}
                      >
                        <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}

          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 10, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#11141c',
    borderRadius: designTokens.borderRadiusLg,
    borderWidth: 1,
    borderColor: '#222733',
    overflow: 'hidden',
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222733',
    backgroundColor: '#161a23',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter_700Bold',
  },
  subtitle: {
    color: '#8a8f98',
    fontSize: 14,
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter_400Regular',
  },
  closeBtn: {
    padding: 8,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  label: {
    color: '#8a8f98',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: -10,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: designTokens.borderRadius || 6,
    padding: 4,
    borderWidth: 1,
    borderColor: '#222733',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: designTokens.borderRadiusSm,
  },
  segmentBtnActive: {
    backgroundColor: '#2e3545',
  },
  segmentText: {
    color: '#8a8f98',
    fontSize: 14,
    fontWeight: '500',
  },
  segmentTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});
