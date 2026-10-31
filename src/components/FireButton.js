import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BulletIcon } from './icons';

export default function FireButton({ onPress, disabled }) {
  return (
    <View style={styles.cluster}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Atirar"
        style={({ pressed }) => [
          styles.wrap,
          pressed && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        <LinearGradient
          colors={['#fde047', '#fb923c', '#dc2626']}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={styles.circle}
        >
          <View style={styles.gloss} pointerEvents="none" />
          <BulletIcon color="#fff7ed" size={36} />
        </LinearGradient>
        <View style={styles.ring} />
      </Pressable>

      <Text style={styles.label}>ATIRAR</Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  cluster: {
    alignItems: 'center',
  },
  wrap: {
    width: 98,
    height: 98,
    borderRadius: 49,
    borderWidth: 2,
    borderColor: 'rgba(251,146,60,0.45)',
    padding: 5,
    backgroundColor: 'rgba(251,146,60,0.1)',
    shadowColor: '#ef4444',
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  circle: {
    flex: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gloss: {
    position: 'absolute',
    top: 7,
    left: 15,
    right: 15,
    height: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.24)',
  },
  ring: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  pressed: {
    transform: [{ scale: 0.93 }],
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    color: '#fed7aa',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.6,
    marginTop: 6,
  },
  spacer: {
    height: 6,
  },
});
