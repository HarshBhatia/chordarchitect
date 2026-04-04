/**
 * Piano Keyboard Visualizer — SVG-based interactive piano
 */

import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Rect, Text as SvgText, G } from 'react-native-svg';
import { useHarmonyStore } from '../store/useHarmonyStore';
import { getPianoKeyMarkers } from '../engine/voicings';
import { FUNCTION_COLORS } from '../engine/constants';
import { designTokens } from '../theme';

// Layout
const OCTAVES = 3;
const WHITE_KEYS_PER_OCTAVE = 7;
const TOTAL_WHITE_KEYS = OCTAVES * WHITE_KEYS_PER_OCTAVE;

const KEY_WIDTH = 36;
const KEY_HEIGHT = 140;
const BLACK_KEY_WIDTH = 22;
const BLACK_KEY_HEIGHT = 88;
const PADDING = 10;

const TOTAL_WIDTH = PADDING * 2 + TOTAL_WHITE_KEYS * KEY_WIDTH;
const TOTAL_HEIGHT = PADDING * 2 + KEY_HEIGHT + 20;

// Map of which chromatic notes are white keys
const WHITE_NOTE_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_KEY_OFFSETS: Record<string, number> = {
  'C#': 0, 'D#': 1, 'F#': 3, 'G#': 4, 'A#': 5,
};

interface WhiteKeyInfo {
  note: string;
  octave: number;
  x: number;
}

interface BlackKeyInfo {
  note: string;
  octave: number;
  x: number;
}

export function PianoKeyboard() {
  const selectedChord = useHarmonyStore(s => s.selectedChord);
  const showIntervals = useHarmonyStore(s => s.showIntervals);

  const markers = useMemo(() => {
    if (!selectedChord) return [];
    return getPianoKeyMarkers(selectedChord.notes, selectedChord.root, 3, 5);
  }, [selectedChord]);

  const markerSet = useMemo(() => {
    const set = new Map<string, typeof markers[0]>();
    markers.forEach(m => set.set(`${m.note}${m.octave}`, m));
    return set;
  }, [markers]);

  const getKeyColor = (isRoot: boolean) => {
    if (isRoot) return designTokens.markerRoot;
    if (!selectedChord) return designTokens.markerActive;
    return FUNCTION_COLORS[selectedChord.function] || designTokens.markerActive;
  };

  // Build white and black key positions
  const whiteKeys: WhiteKeyInfo[] = [];
  const blackKeys: BlackKeyInfo[] = [];

  for (let octave = 3; octave <= 5; octave++) {
    for (let i = 0; i < 7; i++) {
      const keyIdx = (octave - 3) * 7 + i;
      const note = WHITE_NOTE_NAMES[i];
      whiteKeys.push({
        note,
        octave,
        x: PADDING + keyIdx * KEY_WIDTH,
      });

      // Add black key if applicable  
      if (i === 0) { // C# after C
        blackKeys.push({ note: 'C#', octave, x: PADDING + keyIdx * KEY_WIDTH + KEY_WIDTH - BLACK_KEY_WIDTH / 2 });
      } else if (i === 1) { // D# after D
        blackKeys.push({ note: 'D#', octave, x: PADDING + keyIdx * KEY_WIDTH + KEY_WIDTH - BLACK_KEY_WIDTH / 2 });
      } else if (i === 3) { // F# after F
        blackKeys.push({ note: 'F#', octave, x: PADDING + keyIdx * KEY_WIDTH + KEY_WIDTH - BLACK_KEY_WIDTH / 2 });
      } else if (i === 4) { // G# after G
        blackKeys.push({ note: 'G#', octave, x: PADDING + keyIdx * KEY_WIDTH + KEY_WIDTH - BLACK_KEY_WIDTH / 2 });
      } else if (i === 5) { // A# after A
        blackKeys.push({ note: 'A#', octave, x: PADDING + keyIdx * KEY_WIDTH + KEY_WIDTH - BLACK_KEY_WIDTH / 2 });
      }
    }
  }

  return (
    <View style={styles.container}>
      <Svg
        width="100%"
        height={TOTAL_HEIGHT}
        viewBox={`0 0 ${TOTAL_WIDTH} ${TOTAL_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background */}
        <Rect
          x={0} y={0}
          width={TOTAL_WIDTH} height={TOTAL_HEIGHT}
          rx={12}
          fill={designTokens.fretboardBg}
        />

        {/* White keys */}
        {whiteKeys.map((key, i) => {
          const markerKey = `${key.note}${key.octave}`;
          const marker = markerSet.get(markerKey);
          const isActive = !!marker;
          const fillColor = isActive ? getKeyColor(marker!.isRoot) : designTokens.whiteKey;

          return (
            <G key={`white-${i}`}>
              <Rect
                x={key.x + 1}
                y={PADDING}
                width={KEY_WIDTH - 2}
                height={KEY_HEIGHT}
                rx={0}
                ry={0}
                fill={fillColor}
                stroke="rgba(0,0,0,0.15)"
                strokeWidth={0.5}
              />
              {/* Bottom rounding */}
              <Rect
                x={key.x + 1}
                y={PADDING + KEY_HEIGHT - 8}
                width={KEY_WIDTH - 2}
                height={8}
                rx={4}
                fill={fillColor}
              />
              {/* Label */}
              {isActive && (
                <SvgText
                  x={key.x + KEY_WIDTH / 2}
                  y={PADDING + KEY_HEIGHT - 14}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight="700"
                  fill={marker!.isRoot ? '#fff' : 'rgba(0,0,0,0.8)'}
                >
                  {showIntervals ? marker!.displayInterval : marker!.note}
                </SvgText>
              )}
              {/* Octave label for C notes */}
              {key.note === 'C' && (
                <SvgText
                  x={key.x + KEY_WIDTH / 2}
                  y={PADDING + KEY_HEIGHT + 14}
                  textAnchor="middle"
                  fontSize={9}
                  fill="rgba(255,255,255,0.3)"
                >
                  C{key.octave}
                </SvgText>
              )}
            </G>
          );
        })}

        {/* Black keys */}
        {blackKeys.map((key, i) => {
          const markerKey = `${key.note}${key.octave}`;
          const marker = markerSet.get(markerKey);
          const isActive = !!marker;
          const fillColor = isActive ? getKeyColor(marker!.isRoot) : designTokens.blackKey;

          return (
            <G key={`black-${i}`}>
              <Rect
                x={key.x}
                y={PADDING}
                width={BLACK_KEY_WIDTH}
                height={BLACK_KEY_HEIGHT}
                rx={0}
                fill={fillColor}
              />
              {/* Bottom rounding */}
              <Rect
                x={key.x}
                y={PADDING + BLACK_KEY_HEIGHT - 6}
                width={BLACK_KEY_WIDTH}
                height={6}
                rx={3}
                fill={fillColor}
              />
              {isActive && (
                <SvgText
                  x={key.x + BLACK_KEY_WIDTH / 2}
                  y={PADDING + BLACK_KEY_HEIGHT - 10}
                  textAnchor="middle"
                  fontSize={8}
                  fontWeight="700"
                  fill="#fff"
                >
                  {showIntervals ? marker!.displayInterval : marker!.note}
                </SvgText>
              )}
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: designTokens.borderRadius,
    overflow: 'hidden',
    backgroundColor: designTokens.fretboardBg,
    borderWidth: 1,
    borderColor: designTokens.glassBorder,
  },
});
