import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLS, ROWS } from '../game/layout';

const WAVES = [
  { top: 0.16, left: 0.06, width: 0.26 },
  { top: 0.3, left: 0.62, width: 0.3 },
  { top: 0.46, left: 0.2, width: 0.18 },
  { top: 0.62, left: 0.7, width: 0.2 },
  { top: 0.78, left: 0.12, width: 0.32 },
  { top: 0.88, left: 0.55, width: 0.16 },
];

const GRASS_TUFTS = [
  { left: 0.09, top: 0.2 },
  { left: 0.27, top: 0.66 },
  { left: 0.46, top: 0.34 },
  { left: 0.68, top: 0.78 },
  { left: 0.83, top: 0.22 },
  { left: 0.92, top: 0.58 },
];

function BankGrid({ layout, top, height }) {
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', left: 0, right: 0, top, height }}
    >
      {Array.from({ length: COLS - 1 }).map((_, index) => (
        <View
          key={`v-${index}`}
          style={{
            position: 'absolute',
            left: layout.colW * (index + 1),
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: 'rgba(255,255,255,0.045)',
          }}
        />
      ))}
      {Array.from({ length: ROWS - 1 }).map((_, index) => (
        <View
          key={`h-${index}`}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: layout.rowH * (index + 1),
            height: 1,
            backgroundColor: 'rgba(255,255,255,0.045)',
          }}
        />
      ))}
    </View>
  );
}

function GrassTufts({ layout, top, height }) {
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', left: 0, right: 0, top, height }}
    >
      {GRASS_TUFTS.map((tuft, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            left: layout.w * tuft.left,
            top: height * tuft.top,
            width: 2,
            height: 9,
            borderRadius: 2,
            backgroundColor: 'rgba(163,230,53,0.16)',
            transform: [{ rotate: index % 2 ? '14deg' : '-10deg' }],
          }}
        />
      ))}
    </View>
  );
}

export default function ArenaBackground({ layout }) {
  const { w, bankH, riverTop, riverBottom, riverH } = layout;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={['#09271c', '#12522f']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, height: bankH }}
      />
      <LinearGradient
        colors={['#12522f', '#09271c']}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: riverBottom,
          height: bankH,
        }}
      />

      <BankGrid layout={layout} top={0} height={bankH} />
      <BankGrid layout={layout} top={riverBottom} height={bankH} />
      <GrassTufts layout={layout} top={0} height={bankH} />
      <GrassTufts layout={layout} top={riverBottom} height={bankH} />

      <LinearGradient
        colors={['#0a5268', '#0891b2', '#0a5268']}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: riverTop,
          height: riverH,
        }}
      />

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: riverTop,
          height: 3,
          backgroundColor: 'rgba(224,255,255,0.4)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: riverBottom - 3,
          height: 3,
          backgroundColor: 'rgba(224,255,255,0.3)',
        }}
      />

      {WAVES.map((wave, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            left: w * wave.left,
            top: riverTop + riverH * wave.top,
            width: w * wave.width,
            height: 2,
            borderRadius: 1,
            backgroundColor: 'rgba(255,255,255,0.15)',
          }}
        />
      ))}

      <LinearGradient
        colors={[
          'rgba(0,0,0,0.28)',
          'rgba(0,0,0,0)',
          'rgba(0,0,0,0)',
          'rgba(0,0,0,0.3)',
        ]}
        locations={[0, 0.18, 0.82, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
