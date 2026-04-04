/**
 * Guitar Fretboard Visualizer
 * - Strings: high E at top, low E at bottom (standard view)
 * - Per-interval coloring (R=amber, 3=blue, 5=fuchsia, 7=sky, etc.)
 * - Voicing shape cycling with prev/next buttons
 */

import React, { useMemo } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Rect, Line, Circle, Text as SvgText, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useHarmonyStore } from '../store/useHarmonyStore';
import { getVoicingMarkers, getGuitarVoicings } from '../engine/voicings';
import { FRET_COUNT, FRET_MARKERS, DOUBLE_FRET_MARKERS, INTERVAL_COLORS } from '../engine/constants';
import { designTokens } from '../theme';
import { playChord } from '../engine/audio';

const STRINGS = 6;
const FRETS = FRET_COUNT;

const PADDING_LEFT = 36;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 18;
const PADDING_RIGHT = 16;
const STRING_SPACING = 26;
const FRET_SPACING = 50;
const NUT_WIDTH = 4;

const BOARD_WIDTH = PADDING_LEFT + FRET_SPACING * FRETS + PADDING_RIGHT;
const BOARD_HEIGHT = PADDING_TOP + STRING_SPACING * (STRINGS - 1) + PADDING_BOTTOM;

// String labels from top to bottom: high E → low E (guitarist's perspective)
const STRING_LABELS_TOP_DOWN = ['e', 'B', 'G', 'D', 'A', 'E'];
// Mapping: visual row 0 (top) = string index 5 (high E), row 5 (bottom) = string index 0 (low E)
function visualRowToStringIndex(row: number): number {
  return 5 - row;
}

export function Fretboard() {
  const selectedChord = useHarmonyStore(s => s.selectedChord);
  const showIntervals = useHarmonyStore(s => s.showIntervals);
  const voicingIndex = useHarmonyStore(s => s.voicingIndex);
  const nextVoicing = useHarmonyStore(s => s.nextVoicing);
  const prevVoicing = useHarmonyStore(s => s.prevVoicing);

  // Get all voicings for the selected chord
  const voicings = useMemo(() => {
    if (!selectedChord) return [];
    return getGuitarVoicings(selectedChord.symbol);
  }, [selectedChord]);

  const currentVoicingIdx = voicings.length > 0 ? voicingIndex % voicings.length : 0;
  const currentVoicing = voicings[currentVoicingIdx];

  // Get markers for the current voicing shape
  const markers = useMemo(() => {
    if (!selectedChord || !currentVoicing) return [];
    return getVoicingMarkers(currentVoicing, selectedChord.root);
  }, [selectedChord, currentVoicing]);

  const getMarkerColor = (displayInterval: string) => {
    return INTERVAL_COLORS[displayInterval] || '#6C8EFF';
  };

  return (
    <View style={styles.container}>
      {/* Voicing controls */}
      <View style={styles.voicingBar}>
        <Pressable
          style={[styles.voicingBtn, currentVoicingIdx === 0 && styles.voicingBtnDisabled]}
          onPress={prevVoicing}
          disabled={currentVoicingIdx === 0}
        >
          <Ionicons name="chevron-back" size={14} color={currentVoicingIdx === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.6)'} />
        </Pressable>
        <Text style={styles.voicingLabel}>
          {currentVoicing?.label || 'Shape'} ({currentVoicingIdx + 1}/{voicings.length})
        </Text>
        <Pressable
          style={[styles.voicingBtn, currentVoicingIdx >= voicings.length - 1 && styles.voicingBtnDisabled]}
          onPress={nextVoicing}
          disabled={currentVoicingIdx >= voicings.length - 1}
        >
          <Ionicons name="chevron-forward" size={14} color={currentVoicingIdx >= voicings.length - 1 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.6)'} />
        </Pressable>
        <Pressable
          style={styles.playBtn}
          onPress={() => {
            if (selectedChord?.notes?.length) playChord(selectedChord.notes);
          }}
        >
          <Ionicons name="volume-high" size={14} color="#34D399" />
        </Pressable>
      </View>

      <Svg
        width="100%"
        height={BOARD_HEIGHT}
        viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background */}
        <Rect x={0} y={0} width={BOARD_WIDTH} height={BOARD_HEIGHT} rx={0} fill={designTokens.fretboardBg} />

        {/* Nut */}
        <Rect
          x={PADDING_LEFT - NUT_WIDTH / 2} y={PADDING_TOP - 4}
          width={NUT_WIDTH} height={STRING_SPACING * (STRINGS - 1) + 8}
          rx={2} fill={designTokens.nutColor}
        />

        {/* Fret wires */}
        {Array.from({ length: FRETS }, (_, i) => i + 1).map(fret => (
          <Line
            key={`fret-${fret}`}
            x1={PADDING_LEFT + fret * FRET_SPACING} y1={PADDING_TOP - 2}
            x2={PADDING_LEFT + fret * FRET_SPACING} y2={PADDING_TOP + STRING_SPACING * (STRINGS - 1) + 2}
            stroke={designTokens.fretWire} strokeWidth={1.5}
          />
        ))}

        {/* Fret numbers */}
        {Array.from({ length: FRETS }, (_, i) => i + 1).map(fret => (
          <SvgText
            key={`fretnum-${fret}`}
            x={PADDING_LEFT + (fret - 0.5) * FRET_SPACING} y={BOARD_HEIGHT - 2}
            textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.2)" fontWeight="500"
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
                <Circle cx={cx} cy={PADDING_TOP + STRING_SPACING * 1.5 - 6} r={3.5} fill={designTokens.dotColor} />
                <Circle cx={cx} cy={PADDING_TOP + STRING_SPACING * 3.5 + 6} r={3.5} fill={designTokens.dotColor} />
              </G>
            );
          }
          return (
            <Circle key={`marker-${fret}`} cx={cx} cy={PADDING_TOP + STRING_SPACING * 2.5} r={3.5} fill={designTokens.dotColor} />
          );
        })}

        {/* Strings — visual row 0 = high E (top), row 5 = low E (bottom) */}
        {Array.from({ length: STRINGS }, (_, row) => {
          const y = PADDING_TOP + row * STRING_SPACING;
          const stringIdx = visualRowToStringIndex(row);
          // Thicker for lower strings
          const thickness = 0.8 + (stringIdx * 0.35);
          return (
            <Line
              key={`string-${row}`}
              x1={PADDING_LEFT} y1={y}
              x2={PADDING_LEFT + FRETS * FRET_SPACING} y2={y}
              stroke={designTokens.stringColor} strokeWidth={thickness}
            />
          );
        })}

        {/* String labels: high E at top, low E at bottom */}
        {STRING_LABELS_TOP_DOWN.map((note, row) => (
          <SvgText
            key={`label-${row}`}
            x={PADDING_LEFT - 14} y={PADDING_TOP + row * STRING_SPACING + 4}
            textAnchor="middle" fontSize={9}
            fill="rgba(255,255,255,0.3)" fontWeight="500"
          >
            {note}
          </SvgText>
        ))}

        {/* Active voicing markers */}
        {markers.map((marker, idx) => {
          // Convert string index to visual row (inverted)
          const visualRow = 5 - marker.string;
          const cx = marker.fret === 0
            ? PADDING_LEFT - 10
            : PADDING_LEFT + (marker.fret - 0.5) * FRET_SPACING;
          const cy = PADDING_TOP + visualRow * STRING_SPACING;
          const color = getMarkerColor(marker.displayInterval);
          const radius = marker.isRoot ? 11 : 9;

          return (
            <G key={`note-${idx}`}>
              <Circle cx={cx} cy={cy} r={radius + 4} fill={color} opacity={0.15} />
              <Circle cx={cx} cy={cy} r={radius} fill={color} opacity={0.9} />
              <SvgText
                x={cx} y={cy + 3.5}
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

        {/* Muted string indicators (X) */}
        {currentVoicing && currentVoicing.frets.map((fret, stringIdx) => {
          if (fret !== -1) return null;
          const visualRow = 5 - stringIdx;
          const cx = PADDING_LEFT - 10;
          const cy = PADDING_TOP + visualRow * STRING_SPACING;
          return (
            <SvgText
              key={`mute-${stringIdx}`}
              x={cx} y={cy + 4}
              textAnchor="middle" fontSize={10} fontWeight="700"
              fill="rgba(255,255,255,0.2)"
            >
              ×
            </SvgText>
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
  voicingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  voicingBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  voicingBtnDisabled: {
    opacity: 0.4,
  },
  voicingLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  playBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    marginLeft: 4,
  },
});
