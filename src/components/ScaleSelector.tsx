/**
 * Scale Selector — dropdown-style picker for scale/mode selection
 */

import React, { useState } from 'react';
import { StyleSheet, Pressable, View, Modal, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useHarmonyStore } from '../store/useHarmonyStore';
import { AVAILABLE_SCALES } from '../engine/constants';
import { designTokens } from '../theme';
import type { ScaleType } from '../types';

export function ScaleSelector() {
  const scaleType = useHarmonyStore(s => s.scaleType);
  const setScaleType = useHarmonyStore(s => s.setScaleType);
  const [isOpen, setIsOpen] = useState(false);

  const currentScale = AVAILABLE_SCALES.find(s => s.type === scaleType);

  return (
    <View style={styles.container}>
      <Text variant="labelSmall" style={styles.label}>SCALE</Text>
      <Pressable style={styles.button} onPress={() => setIsOpen(true)}>
        <Text variant="labelLarge" style={styles.buttonText}>
          {currentScale?.label || scaleType}
        </Text>
        <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.5)" />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <View style={styles.modalContent}>
            <Text variant="titleMedium" style={styles.modalTitle}>Select Scale</Text>
            <ScrollView style={styles.modalScroll}>
              {(() => {
                let lastCategory = '';
                return AVAILABLE_SCALES.map(scale => {
                  const showCategory = scale.category !== lastCategory;
                  lastCategory = scale.category;
                  return (
                    <React.Fragment key={scale.type}>
                      {showCategory && (
                        <Text variant="labelSmall" style={styles.categoryLabel}>
                          {scale.category.toUpperCase()}
                        </Text>
                      )}
                      <Pressable
                        style={[
                          styles.option,
                          scale.type === scaleType && styles.optionActive,
                        ]}
                        onPress={() => {
                          setScaleType(scale.type);
                          setIsOpen(false);
                        }}
                      >
                        <Text
                          variant="bodyMedium"
                          style={[
                            styles.optionText,
                            scale.type === scaleType && styles.optionTextActive,
                          ]}
                        >
                          {scale.label}
                        </Text>
                        {scale.type === scaleType && (
                          <Ionicons name="checkmark" size={18} color="#6C8EFF" />
                        )}
                      </Pressable>
                    </React.Fragment>
                  );
                });
              })()}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 6,
    marginLeft: 4,
    letterSpacing: 1.5,
    fontSize: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: designTokens.glass,
    borderWidth: 1,
    borderColor: designTokens.glassBorder,
    gap: 8,
  },
  buttonText: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '70%',
    backgroundColor: '#161B2E',
    borderRadius: designTokens.borderRadiusLg,
    padding: 20,
    borderWidth: 1,
    borderColor: designTokens.glassBorder,
  },
  modalTitle: {
    color: '#fff',
    marginBottom: 16,
    fontWeight: '600',
  },
  modalScroll: {
    flex: 1,
  },
  categoryLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    letterSpacing: 1.5,
    marginTop: 12,
    marginBottom: 6,
    paddingLeft: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 2,
  },
  optionActive: {
    backgroundColor: 'rgba(108, 142, 255, 0.12)',
  },
  optionText: {
    color: 'rgba(255,255,255,0.7)',
  },
  optionTextActive: {
    color: '#6C8EFF',
    fontWeight: '600',
  },
});
