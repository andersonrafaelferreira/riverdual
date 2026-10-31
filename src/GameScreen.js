import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useGameEngine from './game/engine';
import ArenaBackground from './components/ArenaBackground';
import Controls from './components/Controls';
import DynamicJoystick from './components/DynamicJoystick';
import { Animal, Fighter, Hearts, Impact, Shot } from './components/entities';
import { GameOverOverlay, IntroOverlay } from './components/Overlays';

export default function GameScreen() {
  const game = useGameEngine();
  const {
    layout,
    status,
    hp,
    maxHp,
    score,
    winner,
    animals,
    shots,
    effects,
    playerAnim,
    enemyAnim,
    movePlayer,
    fire,
    fireSpecial,
    getSpecialCooldown,
    specialCooldownTotal,
    start,
    setArenaSize,
    removeEffect,
  } = game;

  const [specialLeft, setSpecialLeft] = useState(0);
  const flash = useRef(new Animated.Value(0)).current;
  const previousPlayerHp = useRef(hp.player);

  useEffect(() => {
    if (hp.player < previousPlayerHp.current) {
      flash.stopAnimation();
      flash.setValue(0.5);
      Animated.timing(flash, {
        toValue: 0,
        duration: 360,
        useNativeDriver: true,
      }).start();
    }
    previousPlayerHp.current = hp.player;
  }, [hp.player, flash]);

  useEffect(() => {
    if (status !== 'playing') {
      setSpecialLeft(0);
      return undefined;
    }

    const update = () => setSpecialLeft(getSpecialCooldown());
    update();
    const id = setInterval(update, 100);
    return () => clearInterval(id);
  }, [status, getSpecialCooldown]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gesture) =>
          status === 'playing' &&
          (Math.abs(gesture.dx) > 8 || Math.abs(gesture.dy) > 8),
        onPanResponderTerminationRequest: () => false,
        onPanResponderRelease: (_, gesture) => {
          if (Math.abs(gesture.dx) < 14 && Math.abs(gesture.dy) < 14) return;

          if (Math.abs(gesture.dx) > Math.abs(gesture.dy)) {
            movePlayer(gesture.dx > 0 ? 'right' : 'left');
          } else {
            movePlayer(gesture.dy > 0 ? 'down' : 'up');
          }
        },
      }),
    [status, movePlayer]
  );

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return undefined;

    const keys = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      w: 'up',
      s: 'down',
      a: 'left',
      d: 'right',
    };

    const onKeyDown = (event) => {
      const direction = keys[event.key];
      if (direction) {
        event.preventDefault();
        movePlayer(direction);
      }
      if (event.code === 'Space' || event.key === ' ') {
        event.preventDefault();
        fire();
      }
      if (
        event.key === 'e' ||
        event.key === 'E' ||
        event.code === 'ShiftLeft' ||
        event.code === 'ShiftRight'
      ) {
        event.preventDefault();
        fireSpecial();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [movePlayer, fire, fireSpecial]);

  const handleArenaLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setArenaSize(width, height);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View
        style={styles.arenaWrap}
        onLayout={handleArenaLayout}
        {...panResponder.panHandlers}
      >
        {layout ? (
          <>
            <ArenaBackground layout={layout} />

            {animals.map((animal) => (
              <Animal key={animal.id} animal={animal} />
            ))}

            {shots.map((shot) => (
              <Shot key={shot.id} shot={shot} radius={layout.shotRadius} />
            ))}

            <Fighter
              anim={enemyAnim}
              size={layout.fighterSize}
              emoji="🥷"
              color="#fb7185"
            />
            <Fighter
              anim={playerAnim}
              size={layout.fighterSize}
              emoji="🤠"
              color="#4ade80"
            />

            {effects.map((effect) => (
              <Impact key={effect.id} effect={effect} onDone={removeEffect} />
            ))}

            <View style={styles.hudTop} pointerEvents="none">
              <View style={styles.pill}>
                <Text style={styles.pillEmoji}>🥷</Text>
                <Text style={styles.pillLabel}>RIVAL</Text>
                <Hearts value={hp.enemy} color="#fb7185" />
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillEmoji}>🎯</Text>
                <Text style={styles.pillLabel}>{score}</Text>
              </View>
            </View>

            <Animated.View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, styles.damageFlash, { opacity: flash }]}
            />

            {status === 'ready' && <IntroOverlay onStart={start} />}
            {status === 'over' && (
              <GameOverOverlay
                winner={winner}
                score={score}
                onRestart={start}
              />
            )}
          </>
        ) : (
          <View style={styles.loading}>
            <Text style={styles.loadingText}>Carregando o rio...</Text>
          </View>
        )}
      </View>

      <Controls
        hp={hp.player}
        maxHp={maxHp}
        onFire={fire}
        onSpecial={fireSpecial}
        specialCooldown={specialLeft}
        specialCooldownTotal={specialCooldownTotal}
        disabled={status !== 'playing'}
      />

      {status === 'playing' && <DynamicJoystick onStep={movePlayer} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050f0c',
  },
  arenaWrap: {
    flex: 1,
    marginHorizontal: 10,
    marginTop: 6,
    marginBottom: 4,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#09271c',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#5eead4',
    fontSize: 13,
    letterSpacing: 1,
  },
  hudTop: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(2,10,8,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pillEmoji: {
    fontSize: 13,
  },
  pillLabel: {
    color: '#e2e8f0',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  damageFlash: {
    backgroundColor: '#ef4444',
    zIndex: 30,
  },
});
