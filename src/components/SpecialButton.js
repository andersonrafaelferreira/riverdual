import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BurstIcon } from './icons';

export default function SpecialButton({
  onPress,
  disabled,
  cooldown = 0,
  total = 6,
}) {
  const cooling = cooldown > 0.05;
  const inactive = disabled || cooling;
  const remaining = Math.max(1, Math.ceil(cooldown));
  const remainingRatio =
    total > 0 ? Math.min(1, Math.max(0, cooldown / total)) : 0;

  return (
    <View style={styles.cluster}>
      <Pressable
        onPress={onPress}
        disabled={inactive}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={
          cooling
            ? `Poder especial recarregando, ${remaining} segundos`
            : 'Poder especial'
        }
        style={({ pressed }) => [
          styles.wrap,
          pressed && styles.pressed,
          disabled && styles.disabled,
          cooling && styles.inactive,
        ]}
      >
        <LinearGradient
          colors={
            cooling
              ? ['#1e293b', '#0f172a']
              : ['#a5f3fc', '#22d3ee', '#0284c7']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.circle}
        >
          {cooling ? (
            <Text style={styles.cooldown}>{remaining}</Text>
          ) : (
            <BurstIcon color="#ecfeff" size={23} />
          )}
        </LinearGradient>
        <View style={[styles.ring, cooling && styles.ringCooling]} />
      </Pressable>

      <Text
        style={[
          styles.label,
          (cooling || disabled) && styles.labelCooling,
        ]}
      >
        PODER
      </Text>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.round((1 - remainingRatio) * 100)}%`,
              opacity: cooling ? 1 : 0,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cluster: {
    alignItems: 'center',
  },
  wrap: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    borderColor: 'rgba(103,232,249,0.35)',
    padding: 4,
    backgroundColor: 'rgba(34,211,238,0.1)',
    shadowColor: '#22d3ee',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  circle: {
    flex: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: 3,
    bottom: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  ringCooling: {
    borderColor: 'rgba(148,163,184,0.16)',
  },
  pressed: {
    transform: [{ scale: 0.92 }],
  },
  disabled: {
    opacity: 0.45,
    shadowOpacity: 0.15,
    elevation: 0,
  },
  inactive: {
    shadowOpacity: 0.15,
    elevation: 0,
  },
  cooldown: {
    color: '#cbd5e1',
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  label: {
    color: '#a5f3fc',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginTop: 5,
  },
  labelCooling: {
    color: 'rgba(148,163,184,0.75)',
  },
  track: {
    width: 46,
    height: 3,
    borderRadius: 2,
    marginTop: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  fill: {
    height: 3,
    borderRadius: 2,
    backgroundColor: '#22d3ee',
  },
});
