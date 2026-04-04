/**
 * ChordArchitect Design System / Theme
 */

import { MD3DarkTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

const fontConfig = {
  displayLarge: { fontFamily: 'System', fontWeight: '700' as const },
  displayMedium: { fontFamily: 'System', fontWeight: '600' as const },
  displaySmall: { fontFamily: 'System', fontWeight: '600' as const },
  headlineLarge: { fontFamily: 'System', fontWeight: '700' as const },
  headlineMedium: { fontFamily: 'System', fontWeight: '600' as const },
  headlineSmall: { fontFamily: 'System', fontWeight: '600' as const },
  titleLarge: { fontFamily: 'System', fontWeight: '600' as const },
  titleMedium: { fontFamily: 'System', fontWeight: '500' as const },
  titleSmall: { fontFamily: 'System', fontWeight: '500' as const },
  bodyLarge: { fontFamily: 'System', fontWeight: '400' as const },
  bodyMedium: { fontFamily: 'System', fontWeight: '400' as const },
  bodySmall: { fontFamily: 'System', fontWeight: '400' as const },
  labelLarge: { fontFamily: 'System', fontWeight: '500' as const },
  labelMedium: { fontFamily: 'System', fontWeight: '500' as const },
  labelSmall: { fontFamily: 'System', fontWeight: '500' as const },
};

export const theme: MD3Theme = {
  ...MD3DarkTheme,
  dark: true,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#6C8EFF',
    onPrimary: '#FFFFFF',
    primaryContainer: '#1A2744',
    onPrimaryContainer: '#B8CCFF',
    secondary: '#34D399',
    onSecondary: '#003822',
    secondaryContainer: '#143D2E',
    onSecondaryContainer: '#A0F0CC',
    tertiary: '#F87171',
    onTertiary: '#690005',
    tertiaryContainer: '#3D1418',
    onTertiaryContainer: '#FFB4AB',
    error: '#FFB4AB',
    onError: '#690005',
    errorContainer: '#93000A',
    onErrorContainer: '#FFB4AB',
    background: '#0A0E1A',
    onBackground: '#E2E2E9',
    surface: '#0F1423',
    onSurface: '#E2E2E9',
    surfaceVariant: '#161B2E',
    onSurfaceVariant: '#C4C6D0',
    outline: '#2A3050',
    outlineVariant: '#1E2340',
    inverseSurface: '#E2E2E9',
    inverseOnSurface: '#1A1C25',
    inversePrimary: '#4050B5',
    elevation: {
      level0: 'transparent',
      level1: '#121830',
      level2: '#161D38',
      level3: '#1A2240',
      level4: '#1C2444',
      level5: '#1E274A',
    },
    surfaceDisabled: 'rgba(226, 226, 233, 0.12)',
    onSurfaceDisabled: 'rgba(226, 226, 233, 0.38)',
    backdrop: 'rgba(0, 0, 0, 0.6)',
    shadow: '#000000',
    scrim: '#000000',
  },
  fonts: configureFonts({ config: fontConfig }),
};

// Additional design tokens
export const designTokens = {
  // Functional harmony colors
  tonic: '#4A9EFF',
  subdominant: '#34D399',
  dominant: '#F87171',

  tonicGlow: 'rgba(74, 158, 255, 0.25)',
  subdominantGlow: 'rgba(52, 211, 153, 0.25)',
  dominantGlow: 'rgba(248, 113, 113, 0.25)',

  // Surface colors
  glass: 'rgba(255, 255, 255, 0.04)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassHover: 'rgba(255, 255, 255, 0.08)',

  // Fretboard
  fretboardBg: '#0D1117',
  fretColor: '#2A3050',
  fretWire: '#3A4060',
  nutColor: '#D4D4D8',
  stringColor: '#6B7280',
  stringHighlight: '#9CA3AF',
  dotColor: '#1E2340',
  markerActive: '#6C8EFF',
  markerRoot: '#F59E0B',

  // Piano
  whiteKey: '#F8FAFC',
  whiteKeyActive: '#D4E6FF',
  blackKey: '#1E293B',
  blackKeyActive: '#3B65A3',
  keyBorder: '#CBD5E1',

  // Spacing
  borderRadius: 12,
  borderRadiusSm: 8,
  borderRadiusLg: 16,
  borderRadiusXl: 20,

  // Animation
  springConfig: {
    damping: 15,
    stiffness: 150,
    mass: 0.5,
  },
};
