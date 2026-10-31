import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

const BASE_SIZE = 124;
const HANDLE_SIZE = 48;
const MAX_RADIUS = (BASE_SIZE - HANDLE_SIZE) / 2;
const DEADZONE = 0.22;

// Full push = faster steps. Light push = slower, precise steps.
const STEP_MIN_MS = 110;
const STEP_MAX_MS = 230;
const MIN_DIRECTION_GAP = 80;

// Native uses raw touch events so the joystick never becomes the responder
// and a second finger can still press the fire/special buttons. Web keeps the
// PanResponder because it also covers mouse input.
const USE_TOUCH_EVENTS = Platform.OS !== 'web';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function directionFor(x, y) {
  if (Math.abs(x) > Math.abs(y)) return x > 0 ? 'right' : 'left';
  return y > 0 ? 'down' : 'up';
}

function stepDelay(magnitude) {
  return Math.round(STEP_MAX_MS - (STEP_MAX_MS - STEP_MIN_MS) * magnitude);
}

/**
 * Floating joystick for the left half of the screen.
 *
 * - Hidden while idle.
 * - Appears centered exactly where the finger touches.
 * - Emits onStep(direction, intensity) at a cadence based on how far it is pushed.
 * - Hides again on release.
 * - Does not capture the responder, so firing works while moving.
 */
export default function DynamicJoystick({
  onStep,
  onEnd,
  disabled = false,
  style,
}) {
  const [origin, setOrigin] = useState(null);
  const handle = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const state = useRef({
    active: false,
    direction: null,
    magnitude: 0,
    timer: null,
    lastStepAt: 0,
  });
  const touchId = useRef(null);
  const touchStartPage = useRef({ x: 0, y: 0 });

  const onStepRef = useRef(onStep);
  const onEndRef = useRef(onEnd);
  const disabledRef = useRef(disabled);

  onStepRef.current = onStep;
  onEndRef.current = onEnd;
  disabledRef.current = disabled;

  const stopLoop = useCallback(() => {
    const current = state.current;
    if (current.timer) {
      clearTimeout(current.timer);
      current.timer = null;
    }
  }, []);

  const startLoop = useCallback(() => {
    stopLoop();

    const current = state.current;
    const wait = Math.max(
      0,
      MIN_DIRECTION_GAP - (Date.now() - current.lastStepAt)
    );

    const tick = () => {
      const latest = state.current;
      if (!latest.active || !latest.direction) return;

      latest.lastStepAt = Date.now();
      onStepRef.current?.(latest.direction, latest.magnitude);
      latest.timer = setTimeout(tick, stepDelay(latest.magnitude));
    };

    if (wait > 0) {
      current.timer = setTimeout(tick, wait);
    } else {
      tick();
    }
  }, [stopLoop]);

  const finish = useCallback(() => {
    if (!state.current.active) return;

    stopLoop();
    state.current.active = false;
    state.current.direction = null;
    state.current.magnitude = 0;
    state.current.lastStepAt = 0;
    touchId.current = null;
    handle.stopAnimation();
    handle.setValue({ x: 0, y: 0 });
    setOrigin(null);
    onEndRef.current?.();
  }, [handle, stopLoop]);

  const begin = useCallback(
    (point) => {
      stopLoop();

      const current = state.current;
      current.active = true;
      current.direction = null;
      current.magnitude = 0;
      current.lastStepAt = 0;
      handle.setValue({ x: 0, y: 0 });
      setOrigin(point);
    },
    [handle, stopLoop]
  );

  const update = useCallback(
    (dx, dy) => {
      const current = state.current;
      if (!current.active) return;

      const distance = Math.hypot(dx, dy);
      const scale = distance > MAX_RADIUS ? MAX_RADIUS / distance : 1;
      const x = dx * scale;
      const y = dy * scale;
      const magnitude = clamp(distance / MAX_RADIUS, 0, 1);
      const nextDirection =
        magnitude < DEADZONE ? null : directionFor(x, y);

      handle.setValue({ x, y });

      const directionChanged = nextDirection !== current.direction;
      current.direction = nextDirection;
      current.magnitude = magnitude;

      if (!nextDirection) {
        stopLoop();
      } else if (directionChanged) {
        // First step is immediate; the loop then repeats while held.
        startLoop();
      }
    },
    [handle, startLoop, stopLoop]
  );

  useEffect(() => () => stopLoop(), [stopLoop]);

  const findTouch = (event, identifier) =>
    Array.from(event.nativeEvent.changedTouches || []).find(
      (touch) => touch.identifier === identifier
    );

  const handleTouchStart = useCallback(
    (event) => {
      if (disabledRef.current || state.current.active) return;

      const touch = event.nativeEvent.changedTouches?.[0];
      if (!touch) return;

      touchId.current = touch.identifier;
      touchStartPage.current = { x: touch.pageX, y: touch.pageY };
      begin({ x: touch.locationX, y: touch.locationY });
    },
    [begin]
  );

  const handleTouchMove = useCallback(
    (event) => {
      if (!state.current.active || touchId.current == null) return;

      const touch = findTouch(event, touchId.current);
      if (!touch) return;

      update(
        touch.pageX - touchStartPage.current.x,
        touch.pageY - touchStartPage.current.y
      );
    },
    [update]
  );

  const handleTouchEnd = useCallback(
    (event) => {
      if (touchId.current == null) return;
      if (!findTouch(event, touchId.current)) return;

      finish();
    },
    [finish]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabledRef.current,
        onMoveShouldSetPanResponder: () => !disabledRef.current,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          begin({ x: locationX, y: locationY });
        },
        onPanResponderMove: (_, gesture) => update(gesture.dx, gesture.dy),
        onPanResponderRelease: finish,
        onPanResponderTerminate: finish,
      }),
    [begin, finish, update]
  );

  const touchHandlers = USE_TOUCH_EVENTS
    ? {
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        onTouchCancel: handleTouchEnd,
      }
    : panResponder.panHandlers;

  return (
    <>
      <View
        style={[styles.zone, style]}
        {...touchHandlers}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Joystick de movimento. Toque e arraste para mover o personagem."
      />

      {origin ? (
        <View pointerEvents="none" style={styles.visualLayer}>
          <View
            style={[
              styles.base,
              {
                left: origin.x - BASE_SIZE / 2,
                top: origin.y - BASE_SIZE / 2,
              },
            ]}
          >
            <View style={styles.baseRing} />
            <View style={styles.axisH} />
            <View style={styles.axisV} />
            <Animated.View
              style={[
                styles.handle,
                { transform: handle.getTranslateTransform() },
              ]}
            >
              <View style={styles.handleCore} />
            </Animated.View>
          </View>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  zone: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '50%',
    zIndex: 5,
  },
  visualLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 60,
  },
  base: {
    position: 'absolute',
    width: BASE_SIZE,
    height: BASE_SIZE,
    borderRadius: BASE_SIZE / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(165,243,252,0.32)',
    backgroundColor: 'rgba(4,14,11,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22d3ee',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  baseRing: {
    position: 'absolute',
    width: BASE_SIZE - 22,
    height: BASE_SIZE - 22,
    borderRadius: (BASE_SIZE - 22) / 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  axisH: {
    position: 'absolute',
    width: 18,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  axisV: {
    position: 'absolute',
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  handle: {
    position: 'absolute',
    left: (BASE_SIZE - HANDLE_SIZE) / 2,
    top: (BASE_SIZE - HANDLE_SIZE) / 2,
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(165,243,252,0.85)',
    backgroundColor: 'rgba(34,211,238,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22d3ee',
    shadowOpacity: 0.85,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  handleCore: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(236,254,255,0.92)',
  },
});
