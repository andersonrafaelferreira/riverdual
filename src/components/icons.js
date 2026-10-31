import React from 'react';
import { View } from 'react-native';

export function BulletIcon({ color = '#ffffff', size = 30 }) {
  const bodyWidth = size * 0.26;
  const bodyHeight = size * 0.42;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          position: 'absolute',
          width: size * 0.9,
          height: size * 0.9,
          borderRadius: size * 0.45,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.25)',
        }}
      />
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: bodyWidth / 1.5,
          borderRightWidth: bodyWidth / 1.5,
          borderBottomWidth: size * 0.16,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
          marginBottom: -1,
        }}
      />
      <View
        style={{
          width: bodyWidth,
          height: bodyHeight,
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
          borderBottomLeftRadius: bodyWidth / 2,
          borderBottomRightRadius: bodyWidth / 2,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          width: bodyWidth * 1.55,
          height: 2,
          borderRadius: 1,
          backgroundColor: 'rgba(255,255,255,0.55)',
          marginTop: 2,
        }}
      />
    </View>
  );
}

export function BurstIcon({ color = '#ffffff', size = 26 }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {[0, 45, 90, 135].map((angle) => (
        <View
          key={angle}
          style={{
            position: 'absolute',
            width: Math.max(2, size * 0.09),
            height: size,
            borderRadius: size,
            backgroundColor: color,
            transform: [{ rotate: `${angle}deg` }],
          }}
        />
      ))}
      <View
        style={{
          width: size * 0.34,
          height: size * 0.34,
          borderRadius: size,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
