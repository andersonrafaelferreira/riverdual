import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FireButton from './FireButton';
import SpecialButton from './SpecialButton';

function MoveHint() {
  return (
    <View style={styles.moveHint} pointerEvents="none">
      <View style={styles.moveHintDot} />
      <View>
        <Text style={styles.moveHintTitle}>MOVER</Text>
        <Text style={styles.moveHintSub}>toque e arraste</Text>
      </View>
    </View>
  );
}

function HealthBar({ hp, maxHp }) {
  const value = Math.max(0, Math.min(hp, maxHp));

  return (
    <View style={styles.statusRow} pointerEvents="none">
      <Text style={styles.hpLabel}>VOCÊ</Text>
      <View style={styles.segments}>
        {Array.from({ length: maxHp }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.segment,
              index < value ? styles.segmentFull : styles.segmentEmpty,
            ]}
          />
        ))}
      </View>
      <Text style={styles.hpValue}>
        {value}/{maxHp}
      </Text>
    </View>
  );
}

export default function Controls({
  hp,
  maxHp,
  onFire,
  onSpecial,
  specialCooldown = 0,
  specialCooldownTotal = 6,
  disabled = false,
}) {
  return (
    <LinearGradient
      colors={['rgba(5,15,12,0)', 'rgba(4,14,11,0.96)']}
      style={styles.dock}
      pointerEvents="box-none"
    >
      <HealthBar hp={hp} maxHp={maxHp} />

      <View style={styles.row} pointerEvents="box-none">
        <MoveHint />

        <View style={styles.actions} pointerEvents="box-none">
          <SpecialButton
            onPress={onSpecial}
            disabled={disabled}
            cooldown={specialCooldown}
            total={specialCooldownTotal}
          />
          <FireButton onPress={onFire} disabled={disabled} />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  dock: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    zIndex: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 6,
    gap: 10,
  },
  hpLabel: {
    color: '#86efac',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  segments: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    maxWidth: 170,
  },
  segment: {
    flex: 1,
    height: 7,
    borderRadius: 4,
  },
  segmentFull: {
    backgroundColor: '#4ade80',
    shadowColor: '#4ade80',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  segmentEmpty: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  hpValue: {
    marginLeft: 'auto',
    color: 'rgba(226,232,240,0.65)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  moveHint: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 6,
  },
  moveHintDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(165,243,252,0.85)',
    shadowColor: '#22d3ee',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  moveHintTitle: {
    color: 'rgba(165,243,252,0.8)',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  moveHintSub: {
    color: 'rgba(148,163,184,0.65)',
    fontSize: 9,
    marginTop: 2,
  },
});
