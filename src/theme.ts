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
    primary: '#D0BCFF', // Electric Violet
    onPrimary: '#3C0091',
    primaryContainer: '#A078FF',
    onPrimaryContainer: '#E9DDFF',
    secondary: '#44E2CD', // Tonic 
    onSecondary: '#003731',
    secondaryContainer: '#03C6B2',
    onSecondaryContainer: '#62FAE3',
    tertiary: '#FFB95F', // Subdominant
    onTertiary: '#472A00',
    tertiaryContainer: '#CA8100',
    onTertiaryContainer: '#FFDDB8',
    error: '#FFB4AB', // Dominant tension
    onError: '#690005',
    errorContainer: '#93000A',
    onErrorContainer: '#FFDAD6',
    background: '#111125', // surface_dim
    onBackground: '#E2E0FC',
    surface: '#1A1A2E', // surface_container_low
    onSurface: '#E2E0FC',
    surfaceVariant: '#1E1E32', // surface_container
    onSurfaceVariant: '#CBC3D7',
    outline: '#958EA0',
    outlineVariant: '#494454', // Ghost border rule: use with 15% opacity
    inverseSurface: '#E2E0FC',
    inverseOnSurface: '#2F2E43',
    inversePrimary: '#6D3BD7',
    elevation: {
      level0: '#0C0C1F', // surface_container_lowest
      level1: '#111125', // surface_dim
      level2: '#1A1A2E', // surface_container_low
      level3: '#1E1E32', // surface_container
      level4: '#28283D', // surface_container_high
      level5: '#333348', // surface_container_highest
    },
    surfaceDisabled: 'rgba(226, 224, 252, 0.12)',
    onSurfaceDisabled: 'rgba(226, 224, 252, 0.38)',
    backdrop: 'rgba(17, 17, 37, 0.6)',
    shadow: '#000000',
    scrim: '#000000',
  },
  fonts: configureFonts({ config: fontConfig }),
};

// Additional design tokens
export const designTokens = {
  // Functional harmony colors
  tonic: '#44E2CD',
  subdominant: '#FFB95F',
  dominant: '#FFB4AB',

  tonicGlow: 'rgba(68, 226, 205, 0.25)',
  subdominantGlow: 'rgba(255, 185, 95, 0.25)',
  dominantGlow: 'rgba(255, 180, 171, 0.25)',
  primaryGlow: 'rgba(208, 188, 255, 0.25)',

  // Surface colors
  glass: 'rgba(51, 51, 72, 0.6)', // Glassmorphic standard surfaceVariant at 60%
  glassBorder: 'rgba(73, 68, 84, 0.15)', // Ghost Border rule
  glassHover: 'rgba(51, 51, 72, 0.8)',
  
  // Fretboard overrides to fit new nocturne palette
  fretboardBg: '#0C0C1F',
  fretColor: '#1A1A2E',
  fretWire: '#28283D',
  nutColor: '#CBC3D7',
  stringColor: '#494454',
  stringHighlight: '#958EA0',
  dotColor: '#1E1E32',
  markerActive: '#D0BCFF',
  markerRoot: '#44E2CD',

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
