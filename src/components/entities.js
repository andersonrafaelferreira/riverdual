import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

const entity = {
  position: 'absolute',
  left: 0,
  top: 0,
  alignItems: 'center',
  justifyContent: 'center',
};

export function Fighter({ anim, size, emoji, color }) {
  return (
    <Animated.View
      style={[
        entity,
        {
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          transform: anim.getTranslateTransform(),
          zIndex: 5,
        },
      ]}
    >
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: `${color}99`,
          backgroundColor: `${color}1f`,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 1,
          width: size * 0.72,
          height: size * 0.16,
          borderRadius: size * 0.1,
          backgroundColor: 'rgba(0,0,0,0.25)',
        }}
      />
      <Text
        style={{
          fontSize: size * 0.62,
          textShadowColor: 'rgba(0,0,0,0.45)',
          textShadowRadius: 4,
          textShadowOffset: { width: 0, height: 2 },
        }}
      >
        {emoji}
      </Text>
    </Animated.View>
  );
}

export function Animal({ animal }) {
  const { size } = animal;

  return (
    <Animated.View
      style={[
        entity,
        {
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          transform: animal.anim.getTranslateTransform(),
          zIndex: 3,
        },
      ]}
    >
      <View
        style={{
          position: 'absolute',
          bottom: 1,
          width: size * 0.66,
          height: size * 0.15,
          borderRadius: size * 0.08,
          backgroundColor: 'rgba(0,0,0,0.18)',
        }}
      />
      <Text style={{ fontSize: size * 0.82 }}>{animal.emoji}</Text>
    </Animated.View>
  );
}

export function Shot({ shot, radius }) {
  const isPlayer = shot.owner === 'player';
  const isSpecial = Boolean(shot.special);
  const color = isSpecial ? '#67e8f9' : isPlayer ? '#fde047' : '#fb7185';
  const diameter = radius * 2 * (isSpecial ? 1.6 : 1);
  const box = diameter * (isSpecial ? 2.2 : 1.8);

  return (
    <Animated.View
      style={[
        entity,
        {
          width: box,
          height: box,
          marginLeft: -box / 2,
          marginTop: -box / 2,
          transform: shot.anim.getTranslateTransform(),
          zIndex: 6,
        },
      ]}
    >
      <View
        style={{
          position: 'absolute',
          top: isPlayer ? '54%' : '4%',
          width: Math.max(2, radius * (isSpecial ? 1.4 : 0.9)),
          height: radius * (isSpecial ? 4.6 : 1.8),
          borderRadius: radius,
          backgroundColor: `${color}${isSpecial ? '88' : '55'}`,
        }}
      />
      {isSpecial && (
        <View
          style={{
            position: 'absolute',
            width: diameter * 1.55,
            height: diameter * 1.55,
            borderRadius: diameter,
            borderWidth: 1,
            borderColor: 'rgba(165,243,252,0.45)',
            backgroundColor: 'rgba(103,232,249,0.12)',
          }}
        />
      )}
      <View
        style={{
          width: diameter,
          height: diameter,
          borderRadius: diameter / 2,
          backgroundColor: color,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.85)',
          shadowColor: color,
          shadowOpacity: 0.95,
          shadowRadius: isSpecial ? 14 : 8,
          shadowOffset: { width: 0, height: 0 },
          elevation: 6,
        }}
      />
    </Animated.View>
  );
}

export function Impact({ effect, onDone }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 340,
      useNativeDriver: true,
    });

    animation.start(({ finished }) => {
      if (finished) onDone(effect.id);
    });

    return () => animation.stop();
  }, [progress, effect.id, onDone]);

  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1.5],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [1, 0.7, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: effect.x - effect.size / 2,
        top: effect.y - effect.size / 2,
        width: effect.size,
        height: effect.size,
        borderRadius: effect.size / 2,
        borderWidth: 2.5,
        borderColor: effect.color,
        opacity,
        transform: [{ scale }],
        zIndex: 8,
      }}
    >
      <View
        style={{
          position: 'absolute',
          left: '32%',
          top: '32%',
          width: '36%',
          height: '36%',
          borderRadius: 999,
          backgroundColor: effect.color,
          opacity: 0.8,
        }}
      />
    </Animated.View>
  );
}

export function Hearts({ value, max = 3, color = '#fb7185' }) {
  return (
    <View style={styles.hearts}>
      {Array.from({ length: max }).map((_, index) => (
        <Text
          key={index}
          style={[
            styles.heart,
            {
              marginLeft: index === 0 ? 0 : 2,
              color: index < value ? color : 'rgba(255,255,255,0.22)',
            },
          ]}
        >
          {index < value ? '♥' : '♡'}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  hearts: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heart: {
    fontSize: 13,
    fontWeight: '700',
  },
});
