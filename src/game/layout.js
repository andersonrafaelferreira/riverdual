export const COLS = 5;
export const ROWS = 3;
export const RIVER_LANES = 2;

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * Turns the measured arena size into a small world description.
 * Row 0 is always the row closest to the river, for both sides.
 */
export function createLayout(width, height) {
  if (!width || !height) return null;

  const riverH = height * 0.23;
  const bankH = (height - riverH) / 2;
  const rowH = bankH / ROWS;
  const colW = width / COLS;

  const riverTop = bankH;
  const riverBottom = bankH + riverH;

  const laneYs = [riverTop + riverH * 0.28, riverTop + riverH * 0.72];

  const unit = Math.min(colW, rowH);
  const fighterSize = Math.min(unit * 0.88, 64);
  const animalSize = Math.min(colW * 0.9, riverH * 0.6, 56);
  const shotRadius = Math.max(4, Math.min(8, colW * 0.085));

  const posFor = (side, row, col) => ({
    x: colW * (col + 0.5),
    y:
      side === 'player'
        ? riverBottom + rowH * (row + 0.5)
        : riverTop - rowH * (row + 0.5),
  });

  return {
    w: width,
    h: height,
    riverH,
    bankH,
    rowH,
    colW,
    riverTop,
    riverBottom,
    laneYs,
    fighterSize,
    animalSize,
    shotRadius,
    posFor,
  };
}
