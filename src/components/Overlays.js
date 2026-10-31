import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

function PrimaryButton({ label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.primaryWrap, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={['#fbbf24', '#f97316']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.primary}
      >
        <Text style={styles.primaryLabel}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

function Chip({ children, dot }) {
  return (
    <View style={styles.chip}>
      {dot ? <View style={[styles.chipDot, { backgroundColor: dot }]} /> : null}
      <Text style={styles.chipText}>{children}</Text>
    </View>
  );
}

export function IntroOverlay({ onStart }) {
  return (
    <View style={styles.overlay}>
      <LinearGradient
        colors={['rgba(3,12,9,0.88)', 'rgba(3,12,9,0.97)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <Text style={styles.kicker}>MVP · 1 VS 1</Text>
        <Text style={styles.title}>DUELO{'\n'}DO RIO</Text>
        <Text style={styles.subtitle}>
          Acerte o rival do outro lado do rio.{'\n'}
          Cuidado com os bichos na água.
        </Text>

        <View style={styles.chips}>
          <Chip dot="#e2e8f0">Joystick à esquerda</Chip>
          <Chip dot="#fb923c">ATIRAR dispara reto</Chip>
          <Chip dot="#22d3ee">PODER perfura · 2 de dano</Chip>
        </View>

        <PrimaryButton label="COMEÇAR" onPress={onStart} />
        <Text style={styles.tiny}>
          Poder recarrega em 6s · Zere os 3 corações do rival
        </Text>
      </View>
    </View>
  );
}

export function GameOverOverlay({ winner, score, onRestart }) {
  const won = winner === 'player';

  return (
    <View style={styles.overlay}>
      <LinearGradient
        colors={['rgba(3,12,9,0.9)', 'rgba(3,12,9,0.98)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <Text style={styles.resultEmoji}>{won ? '🏆' : '💀'}</Text>
        <Text
          style={[
            styles.title,
            styles.resultTitle,
            { color: won ? '#86efac' : '#fca5a5' },
          ]}
        >
          {won ? 'VITÓRIA!' : 'DERROTA'}
        </Text>
        <Text style={styles.subtitle}>
          {won
            ? 'Você acertou o rival 3 vezes.'
            : 'O rival acertou você 3 vezes.'}
        </Text>

        <View style={styles.scoreChip}>
          <Text style={styles.scoreChipText}>
            🎯 {score} {score === 1 ? 'acerto' : 'acertos'}
          </Text>
        </View>

        <PrimaryButton label="JOGAR DE NOVO" onPress={onRestart} />
        <Text style={styles.tiny}>Dica: use os bichos como escudo</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  kicker: {
    color: '#5eead4',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 12,
  },
  title: {
    color: '#f8fafc',
    fontSize: 46,
    lineHeight: 46,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
  },
  resultEmoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 38,
    lineHeight: 42,
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 14,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 22,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
  },
  scoreChip: {
    backgroundColor: 'rgba(251,191,36,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.3)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginTop: 18,
  },
  scoreChipText: {
    color: '#fde68a',
    fontSize: 14,
    fontWeight: '800',
  },
  primaryWrap: {
    marginTop: 24,
    width: 250,
    maxWidth: '100%',
    borderRadius: 999,
    shadowColor: '#f97316',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  primary: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryLabel: {
    color: '#1c1917',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 2,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  tiny: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 14,
    textAlign: 'center',
  },
});
