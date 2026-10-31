import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLS, ROWS, RIVER_LANES, clamp, createLayout } from './layout';

const MAX_HP = 3;
const PLAYER_SHOT_SPEED = 780;
const ENEMY_SHOT_SPEED = 610;
const PLAYER_COOLDOWN = 0.26;
const INVULN_TIME = 1.15;
const SPECIAL_COOLDOWN = 6;
const SPECIAL_SHOT_SPEED = 900;
const SPECIAL_DAMAGE = 2;

const ANIMAL_EMOJIS = ['🐊', '🐢', '🐟', '🪵', '🦛', '🐍'];

const rand = (min, max) => min + Math.random() * (max - min);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

function buzz(action) {
  if (Platform.OS === 'web') return;
  try {
    const result = action();
    if (result && typeof result.catch === 'function') result.catch(() => {});
  } catch {
    // Haptics are a nice-to-have; never break the game because of them.
  }
}

function buildAnimals(layout) {
  const list = [];

  for (let lane = 0; lane < RIVER_LANES; lane += 1) {
    for (let i = 0; i < 2; i += 1) {
      const size = layout.animalSize * rand(0.85, 1.05);
      const dir = Math.random() < 0.5 ? -1 : 1;
      const x =
        ((i + 0.5) / 2) * layout.w +
        rand(-layout.colW * 0.4, layout.colW * 0.4);
      const y = layout.laneYs[lane];
      const anim = new Animated.ValueXY({ x, y });

      list.push({
        id: `animal-${lane}-${i}-${Math.random().toString(36).slice(2, 7)}`,
        lane,
        x,
        y,
        dir,
        size,
        speed: rand(42, 88),
        emoji: pick(ANIMAL_EMOJIS),
        anim,
      });
    }
  }

  return list;
}

export default function useGameEngine() {
  const [arena, setArena] = useState(null);
  const layout = useMemo(
    () => (arena ? createLayout(arena.w, arena.h) : null),
    [arena]
  );
  const layoutRef = useRef(null);

  const [status, setStatus] = useState('ready');
  const statusRef = useRef('ready');
  const [hp, setHp] = useState({ player: MAX_HP, enemy: MAX_HP });
  const hpRef = useRef({ player: MAX_HP, enemy: MAX_HP });
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [winner, setWinner] = useState(null);

  const [animals, setAnimals] = useState([]);
  const [shots, setShots] = useState([]);
  const [effects, setEffects] = useState([]);

  const animalsRef = useRef([]);
  const shotsRef = useRef([]);
  const effectsRef = useRef([]);

  const playerAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const enemyAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const playerCell = useRef({ row: 1, col: 2 });
  const enemyCell = useRef({ row: 1, col: 2 });

  const clock = useRef(0);
  const lastShotAt = useRef(-1);
  const specialReadyAt = useRef(0);
  const invulnUntil = useRef(0);
  const nextId = useRef(1);
  const aiRef = useRef({ moveIn: 1.1, shootIn: 2.2 });

  const setPhase = useCallback((next) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const setArenaSize = useCallback((w, h) => {
    if (!w || !h) return;
    setArena((prev) => {
      if (prev && Math.abs(prev.w - w) < 0.5 && Math.abs(prev.h - h) < 0.5) {
        return prev;
      }
      return { w, h };
    });
  }, []);

  const placeFighter = useCallback(
    (side, row, col, animate) => {
      const current = layoutRef.current;
      if (!current) return;
      const anim = side === 'player' ? playerAnim : enemyAnim;
      const point = current.posFor(side, row, col);

      if (animate) {
        Animated.spring(anim, {
          toValue: point,
          speed: 26,
          bounciness: 5,
          useNativeDriver: false,
        }).start();
      } else {
        anim.stopAnimation();
        anim.setValue(point);
      }
    },
    [playerAnim, enemyAnim]
  );

  const spawnEffect = useCallback((x, y, color, size = 52) => {
    const effect = { id: nextId.current++, x, y, color, size };
    effectsRef.current = [...effectsRef.current, effect];
    setEffects(effectsRef.current);
  }, []);

  const removeEffect = useCallback((id) => {
    effectsRef.current = effectsRef.current.filter((fx) => fx.id !== id);
    setEffects(effectsRef.current);
  }, []);

  const spawnShot = useCallback(
    (owner, options = {}) => {
      const current = layoutRef.current;
      if (!current) return;

      const special = Boolean(options.special);
      const cell = owner === 'player' ? playerCell.current : enemyCell.current;
      const point = current.posFor(owner, cell.row, cell.col);
      const offset = current.fighterSize * 0.52;
      const x = point.x;
      const y = owner === 'player' ? point.y - offset : point.y + offset;

      const shot = {
        id: nextId.current++,
        owner,
        special,
        power: special ? SPECIAL_DAMAGE : 1,
        pierced: special ? new Set() : null,
        x,
        y,
        anim: new Animated.ValueXY({ x, y }),
      };

      shotsRef.current = [...shotsRef.current, shot];
      setShots(shotsRef.current);
      spawnEffect(
        x,
        y,
        special
          ? '#a5f3fc'
          : owner === 'player'
            ? '#fde68a'
            : '#fda4af',
        special ? 48 : 26
      );
    },
    [spawnEffect]
  );

  const fire = useCallback(() => {
    if (statusRef.current !== 'playing') return;
    if (clock.current - lastShotAt.current < PLAYER_COOLDOWN) return;

    lastShotAt.current = clock.current;
    spawnShot('player');
    buzz(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
  }, [spawnShot]);

  const fireSpecial = useCallback(() => {
    if (statusRef.current !== 'playing') return;
    if (clock.current < specialReadyAt.current) return;

    specialReadyAt.current = clock.current + SPECIAL_COOLDOWN;
    spawnShot('player', { special: true });
    buzz(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
  }, [spawnShot]);

  const getSpecialCooldown = useCallback(
    () => Math.max(0, specialReadyAt.current - clock.current),
    []
  );

  const damageFighter = useCallback(
    (target, point, amount = 1) => {
      if (target === 'player' && clock.current < invulnUntil.current) {
        spawnEffect(point.x, point.y, '#fca5a5', 34);
        return;
      }

      if (target === 'player') {
        invulnUntil.current = clock.current + INVULN_TIME;
      }

      spawnEffect(
        point.x,
        point.y,
        target === 'enemy' ? '#fbbf24' : '#f87171',
        amount > 1 ? 76 : 58
      );
      buzz(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));

      if (target === 'enemy') {
        scoreRef.current += 1;
        setScore(scoreRef.current);
      }

      const nextHp = {
        ...hpRef.current,
        [target]: Math.max(0, hpRef.current[target] - amount),
      };
      hpRef.current = nextHp;
      setHp(nextHp);

      if (nextHp[target] <= 0) {
        const who = target === 'enemy' ? 'player' : 'enemy';
        setWinner(who);
        setPhase('over');
        buzz(() =>
          Haptics.notificationAsync(
            who === 'player'
              ? Haptics.NotificationFeedbackType.Success
              : Haptics.NotificationFeedbackType.Error
          )
        );
      }
    },
    [spawnEffect, setPhase]
  );

  const moveEnemy = useCallback(
    (dir) => {
      const cell = enemyCell.current;
      let { row, col } = cell;

      if (dir === 'up') row -= 1;
      else if (dir === 'down') row += 1;
      else if (dir === 'left') col -= 1;
      else if (dir === 'right') col += 1;

      row = clamp(row, 0, ROWS - 1);
      col = clamp(col, 0, COLS - 1);

      if (row === cell.row && col === cell.col) return;
      enemyCell.current = { row, col };
      placeFighter('enemy', row, col, true);
    },
    [placeFighter]
  );

  const movePlayer = useCallback(
    (dir) => {
      if (statusRef.current !== 'playing') return;

      const cell = playerCell.current;
      let { row, col } = cell;

      if (dir === 'up') row -= 1;
      else if (dir === 'down') row += 1;
      else if (dir === 'left') col -= 1;
      else if (dir === 'right') col += 1;

      row = clamp(row, 0, ROWS - 1);
      col = clamp(col, 0, COLS - 1);

      if (row === cell.row && col === cell.col) return;
      playerCell.current = { row, col };
      placeFighter('player', row, col, true);
      buzz(() => Haptics.selectionAsync());
    },
    [placeFighter]
  );

  const update = useCallback(
    (dt) => {
      const current = layoutRef.current;
      if (!current) return;

      clock.current += dt;

      // River animals swim from one side to the other and block shots.
      for (const animal of animalsRef.current) {
        animal.x += animal.dir * animal.speed * dt;

        if (animal.x > current.w + animal.size) {
          animal.x = -animal.size;
          animal.emoji = pick(ANIMAL_EMOJIS);
          animal.speed = rand(42, 88);
        } else if (animal.x < -animal.size) {
          animal.x = current.w + animal.size;
          animal.emoji = pick(ANIMAL_EMOJIS);
          animal.speed = rand(42, 88);
        }

        animal.anim.setValue({ x: animal.x, y: animal.y });
      }

      // Shots fly in a straight line: no aiming once fired.
      if (shotsRef.current.length > 0) {
        const alive = [];

        for (const shot of shotsRef.current) {
          const speed =
            shot.owner === 'player'
              ? -(shot.special ? SPECIAL_SHOT_SPEED : PLAYER_SHOT_SPEED)
              : ENEMY_SHOT_SPEED;

          shot.y += speed * dt;
          shot.anim.setValue({ x: shot.x, y: shot.y });

          let blocked = false;
          for (const animal of animalsRef.current) {
            const overlaps =
              Math.abs(shot.y - animal.y) < animal.size * 0.44 &&
              Math.abs(shot.x - animal.x) < animal.size * 0.44;

            if (!overlaps) continue;

            if (shot.special) {
              if (!shot.pierced.has(animal.id)) {
                shot.pierced.add(animal.id);
                spawnEffect(shot.x, shot.y, '#a5f3fc', animal.size * 0.7);
              }
              continue;
            }

            animal.dir *= -1;
            spawnEffect(shot.x, shot.y, '#a5f3fc', animal.size * 0.9);
            blocked = true;
            break;
          }
          if (blocked) continue;

          if (shot.owner === 'player') {
            const target = current.posFor(
              'enemy',
              enemyCell.current.row,
              enemyCell.current.col
            );

            if (
              Math.abs(shot.x - target.x) < current.fighterSize * 0.42 &&
              Math.abs(shot.y - target.y) < current.fighterSize * 0.5
            ) {
              damageFighter('enemy', target, shot.power);
              continue;
            }

            if (shot.y < -40) continue;
          } else {
            const target = current.posFor(
              'player',
              playerCell.current.row,
              playerCell.current.col
            );

            if (
              Math.abs(shot.x - target.x) < current.fighterSize * 0.42 &&
              Math.abs(shot.y - target.y) < current.fighterSize * 0.5
            ) {
              damageFighter('player', target, shot.power);
              continue;
            }

            if (shot.y > current.h + 40) continue;
          }

          alive.push(shot);
        }

        if (alive.length !== shotsRef.current.length) {
          shotsRef.current = alive;
          setShots(alive);
        }
      }

      // Rival AI: strafes, dodges incoming shots and fires when lined up.
      const ai = aiRef.current;
      ai.moveIn -= dt;
      ai.shootIn -= dt;

      if (ai.moveIn <= 0) {
        ai.moveIn = rand(0.65, 1.35);

        const cell = enemyCell.current;
        const myPoint = current.posFor('enemy', cell.row, cell.col);
        const incoming = shotsRef.current.some(
          (shot) =>
            shot.owner === 'player' &&
            shot.y < current.riverTop + current.rowH * 1.25 &&
            Math.abs(shot.x - myPoint.x) < current.colW * 0.55
        );

        let dir = null;

        if (incoming && Math.random() < 0.72) {
          dir =
            cell.col <= 0
              ? 'right'
              : cell.col >= COLS - 1
                ? 'left'
                : Math.random() < 0.5
                  ? 'left'
                  : 'right';
        } else {
          const roll = Math.random();

          if (roll < 0.5 && playerCell.current.col !== cell.col) {
            dir = playerCell.current.col < cell.col ? 'left' : 'right';
          } else if (roll < 0.82) {
            dir = pick(['left', 'right', 'up', 'down']);
          }
        }

        if (dir) moveEnemy(dir);
      }

      if (ai.shootIn <= 0) {
        ai.shootIn = rand(1.25, 2.1);

        const aligned = enemyCell.current.col === playerCell.current.col;
        if (aligned || Math.random() < 0.2) {
          spawnShot('enemy');
          buzz(() => Haptics.selectionAsync());
        }
      }
    },
    [damageFighter, moveEnemy, spawnEffect, spawnShot]
  );

  useEffect(() => {
    if (status !== 'playing' || !layout) return undefined;

    let frame = 0;
    let last = 0;

    const tick = (now) => {
      if (!last) last = now;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      update(dt);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [status, layout, update]);

  const resetGame = useCallback(() => {
    const current = layoutRef.current;
    if (!current) return;

    playerCell.current = { row: 1, col: 2 };
    enemyCell.current = { row: 1, col: 2 };
    hpRef.current = { player: MAX_HP, enemy: MAX_HP };
    setHp(hpRef.current);
    scoreRef.current = 0;
    setScore(0);
    setWinner(null);

    clock.current = 0;
    lastShotAt.current = -1;
    specialReadyAt.current = 0;
    invulnUntil.current = 0;
    aiRef.current = { moveIn: 1.1, shootIn: 2.2 };

    shotsRef.current = [];
    setShots([]);
    effectsRef.current = [];
    setEffects([]);

    placeFighter('player', 1, 2, false);
    placeFighter('enemy', 1, 2, false);

    const nextAnimals = buildAnimals(current);
    animalsRef.current = nextAnimals;
    setAnimals(nextAnimals);
  }, [placeFighter]);

  const start = useCallback(() => {
    if (!layoutRef.current) return;
    resetGame();
    setPhase('playing');
    buzz(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
  }, [resetGame, setPhase]);

  useEffect(() => {
    layoutRef.current = layout;
    if (!layout) return;

    placeFighter('player', playerCell.current.row, playerCell.current.col, false);
    placeFighter('enemy', enemyCell.current.row, enemyCell.current.col, false);

    const nextAnimals = buildAnimals(layout);
    animalsRef.current = nextAnimals;
    setAnimals(nextAnimals);

    if (shotsRef.current.length > 0) {
      shotsRef.current = [];
      setShots([]);
    }
  }, [layout, placeFighter]);

  return {
    layout,
    setArenaSize,
    status,
    hp,
    maxHp: MAX_HP,
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
    specialCooldownTotal: SPECIAL_COOLDOWN,
    start,
    removeEffect,
  };
}
