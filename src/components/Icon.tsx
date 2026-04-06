import React from 'react';
import { Ionicons } from '@expo/vector-icons';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  'chevron-down': 'chevron-down',
  'chevron-back': 'chevron-back',
  'chevron-forward': 'chevron-forward',
  'checkmark': 'checkmark',
  'add': 'add',
  'close': 'close',
  'trash-outline': 'trash-outline',
  'arrow-forward': 'arrow-forward',
  'play': 'play',
  'stop': 'square',
  'volume-high': 'volume-high',
  'musical-notes-outline': 'musical-notes-outline',
  'musical-notes': 'musical-notes',
  'sparkles': 'sparkles',
  'swap-horizontal': 'swap-horizontal',
  'time': 'time-outline',
  'pencil': 'pencil-outline',
  'download-outline': 'download-outline',
  'options': 'options-outline',
};

export function Icon({ name, size = 16, color = '#fff' }: IconProps) {
  const iconName = ICON_MAP[name] || 'ellipse-outline';
  return <Ionicons name={iconName} size={size} color={color} />;
}
