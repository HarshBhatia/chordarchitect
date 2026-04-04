/**
 * Guitar Fretboard Visualizer — SVG-based interactive fretboard
 */

import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Rect, Line, Circle, Text as SvgText, G } from 'react-native-svg';
import { useHarmonyStore } from '../store/useHarmonyStore';
import { getFretboardMarkers } from '../engine/voicings';
import { FRET_COUNT, FRET_MARKERS, DOUBLE_FRET_MARKERS, FUNCTION_COLORS } from '../engine/constants';
import { designTokens } from '../theme';

const STRINGS = 6;
const FRETS = FRET_COUNT;

// Layout constants
const PADDING_LEFT = 40;
const PADDING_TOP = 20;
const PADDING_BOTTOM = 20;
const PADDING_RIGHT = 20;
const STRING_SPACING = 28;
const FRET_SPACING = 52;
const NUT_WIDTH = 4;

const BOARD_WIDTH = PADDING_LEFT + FRET_SPACING * FRETS + PADDING_RIGHT;
const BOARD_HEIGHT = PADDING_TOP + STRING_SPACING * (STRINGS - 1) + PADDING_BOTTOM;

export function Fretboard() {
  const selectedChord = useHarmonyStore(s => s.selectedChord);
  const showIntervals = useHarmonyStore(s => s.showIntervals);

  const markers = useMemo(() => {
    if (!selectedChord) return [];
    return getFretboardMarkers(selectedChord.notes, selectedChord.root);
  }, [selectedChord]);

  const getMarkerColor = (isRoot: boolean) => {
    if (isRoot) return designTokens.markerRoot;
    if (!selectedChord) return designTokens.markerActive;
    return FUNCTION_COLORS[selectedChord.function] || designTokens.markerActive;
  };

  return (
    <View style={styles.container}>
      <Svg
        width="100%"
        height={BOARD_HEIGHT}
        viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background */}
        <Rect
          x={0} y={0}
          width={BOARD_WIDTH} height={BOARD_HEIGHT}
          rx={12}
          fill={designTokens.fretboardBg}
        />

        {/* Nut */}
        <Rect
          x={PADDING_LEFT - NUT_WIDTH / 2}
          y={PADDING_TOP - 4}
          width={NUT_WIDTH}
          height={STRING_SPACING * (STRINGS - 1) + 8}
          rx={2}
          fill={designTokens.nutColor}
        />

        {/* Fret wires */}
        {Array.from({ length: FRETS }, (_, i) => i + 1).map(fret => (
          <Line
            key={`fret-${fret}`}
            x1={PADDING_LEFT + fret * FRET_SPACING}
            y1={PADDING_TOP - 2}
            x2={PADDING_LEFT + fret * FRET_SPACING}
            y2={PADDING_TOP + STRING_SPACING * (STRINGS - 1) + 2}
            stroke={designTokens.fretWire}
            strokeWidth={1.5}
          />
        ))}

        {/* Fret numbers */}
        {Array.from({ length: FRETS }, (_, i) => i + 1).map(fret => (
          <SvgText
            key={`fretnum-${fret}`}
            x={PADDING_LEFT + (fret - 0.5) * FRET_SPACING}
            y={BOARD_HEIGHT - 4}
            textAnchor="middle"
            fontSize={8}
            fill="rgba(255,255,255,0.2)"
            fontWeight="500"
          >
            {fret}
          </SvgText>
        ))}

        {/* Fret markers (dots) */}
        {FRET_MARKERS.map(fret => {
          const isDouble = DOUBLE_FRET_MARKERS.includes(fret);
          const cx = PADDING_LEFT + (fret - 0.5) * FRET_SPACING;

          if (isDouble) {
            return (
              <G key={`marker-${fret}`}>
                <Circle
                  cx={cx}
                  cy={PADDING_TOP + STRING_SPACING * 1.5 - 8}
                  r={4}
                  fill={designTokens.dotColor}
                />
                <Circle
                  cx={cx}
                  cy={PADDING_TOP + STRING_SPACING * 3.5 + 8}
                  r={4}
                  fill={designTokens.dotColor}
                />
              </G>
            );
          }

          return (
            <Circle
              key={`marker-${fret}`}
              cx={cx}
              cy={PADDING_TOP + STRING_SPACING * 2.5}
              r={4}
              fill={designTokens.dotColor}
            />
          );
        })}

        {/* Strings */}
        {Array.from({ length: STRINGS }, (_, i) => {
          const y = PADDING_TOP + i * STRING_SPACING;
          const thickness = 1 + (i * 0.3); // thicker for lower strings
          return (
            <Line
              key={`string-${i}`}
              x1={PADDING_LEFT}
              y1={y}
              x2={PADDING_LEFT + FRETS * FRET_SPACING}
              y2={y}
              stroke={designTokens.stringColor}
              strokeWidth={thickness}
            />
          );
        })}

        {/* String labels (open notes) */}
        {['E', 'A', 'D', 'G', 'B', 'E'].map((note, i) => (
          <SvgText
            key={`label-${i}`}
            x={PADDING_LEFT - 16}
            y={PADDING_TOP + i * STRING_SPACING + 4}
            textAnchor="middle"
            fontSize={10}
            fill="rgba(255,255,255,0.3)"
            fontWeight="500"
          >
            {note}
          </SvgText>
        ))}

        {/* Active chord markers */}
        {markers.map((marker, idx) => {
          const cx = marker.fret === 0
            ? PADDING_LEFT - 12
            : PADDING_LEFT + (marker.fret - 0.5) * FRET_SPACING;
          const cy = PADDING_TOP + marker.string * STRING_SPACING;
          const color = getMarkerColor(marker.isRoot);
          const radius = marker.isRoot ? 11 : 9;

          return (
            <G key={`note-${idx}`}>
              {/* Glow */}
              <Circle
                cx={cx} cy={cy} r={radius + 4}
                fill={color}
                opacity={0.15}
              />
              {/* Main dot */}
              <Circle
                cx={cx} cy={cy} r={radius}
                fill={color}
                opacity={0.9}
              />
              {/* Label */}
              <SvgText
                x={cx}
                y={cy + 3.5}
                textAnchor="middle"
                fontSize={marker.isRoot ? 9 : 8}
                fontWeight={marker.isRoot ? '700' : '600'}
                fill="#fff"
              >
                {showIntervals ? marker.displayInterval : marker.note}
              </SvgText>
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
