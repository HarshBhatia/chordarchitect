/**
 * Progression Templates — quick-load common progressions
 */

import React from 'react';
import { ScrollView, StyleSheet, Pressable, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useHarmonyStore } from '../store/useHarmonyStore';
import { PROGRESSION_TEMPLATES } from '../engine/constants';
import { designTokens } from '../theme';

export function ProgressionTemplates() {
  const loadTemplate = useHarmonyStore(s => s.loadTemplate);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {PROGRESSION_TEMPLATES.map(template => (
        <Pressable
          key={template.name}
          style={styles.templateBtn}
          onPress={() => loadTemplate(template.name)}
        >
          <Text style={styles.templateName}>{template.name}</Text>
          <Text style={styles.templateLabel}>{template.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 8,
    paddingHorizontal: 2,
    paddingBottom: 8,
  },
  templateBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: designTokens.glass,
    borderWidth: 1,
    borderColor: designTokens.glassBorder,
    alignItems: 'center',
    gap: 2,
  },
  templateName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  templateLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    fontWeight: '500',
  },
});
