/**
 * Icon — lightweight unicode-based icons (no font dependencies)
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

// Unicode mappings for icons we use
const ICON_MAP: Record<string, string> = {
  'chevron-down': '▾',
  'chevron-back': '‹',
  'chevron-forward': '›',
  'checkmark': '✓',
  'add': '+',
  'close': '×',
  'trash-outline': '🗑',
  'arrow-forward': '→',
  'play': '▶',
  'stop': '■',
  'volume-high': '♪',
  'musical-notes-outline': '♫',
  'musical-notes': '♫',
  'sparkles': '✦',
  'swap-horizontal': '⇄',
};

export function Icon({ name, size = 16, color = '#fff' }: IconProps) {
  const char = ICON_MAP[name] || '•';
  return (
    <Text
      style={[
        styles.icon,
        {
          fontSize: size,
          color,
          lineHeight: size * 1.2,
        },
      ]}
      selectable={false}
    >
      {char}
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
    fontWeight: '400',
  },
});
