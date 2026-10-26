export const CUBIE_SIZE = 54;
export const CUBIE_STEP = 61;
export const TURN_DURATION = 360;

export const SOLVED_COLORS = Object.freeze({
  front: "#f0644e",
  back: "#f5a23b",
  right: "#428fda",
  left: "#69b876",
  top: "#fff5d9",
  bottom: "#ffd34f",
});

const FACE_VECTORS = Object.freeze({
  front: [0, 0, 1],
  back: [0, 0, -1],
  right: [1, 0, 0],
  left: [-1, 0, 0],
  top: [0, -1, 0],
  bottom: [0, 1, 0],
});

const VECTOR_FACES = new Map(
  Object.entries(FACE_VECTORS).map(([face, vector]) => [vector.join(","), face]),
);

const AXES = Object.freeze(["x", "y", "z"]);
const MOVE_FACES = Object.freeze({
  "x,-1": "L",
  "x,1": "R",
  "y,-1": "U",
  "y,1": "D",
  "z,-1": "B",
  "z,1": "F",
});

export function createSolvedCube() {
  const cubies = [];

  for (let x = -1; x <= 1; x += 1) {
    for (let y = -1; y <= 1; y += 1) {
      for (let z = -1; z <= 1; z += 1) {
        if (x === 0 && y === 0 && z === 0) continue;

        const stickers = {};
        if (z === 1) stickers.front = SOLVED_COLORS.front;
        if (z === -1) stickers.back = SOLVED_COLORS.back;
        if (x === 1) stickers.right = SOLVED_COLORS.right;
        if (x === -1) stickers.left = SOLVED_COLORS.left;
        if (y === -1) stickers.top = SOLVED_COLORS.top;
        if (y === 1) stickers.bottom = SOLVED_COLORS.bottom;

        cubies.push({
          id: `${x},${y},${z}`,
          position: { x, y, z },
          stickers,
        });
      }
    }
  }

  return cubies;
}

function rotateVector(vector, axis, direction) {
  const [x, y, z] = vector;

  if (axis === "x") return [x, -direction * z, direction * y];
  if (axis === "y") return [direction * z, y, -direction * x];
  return [-direction * y, direction * x, z];
}

export function getLayerCubies(cubies, move) {
  return cubies.filter((cubie) => cubie.position[move.axis] === move.layer);
}

export function applyMove(cubies, move) {
  if (!AXES.includes(move.axis) || ![-1, 1].includes(move.layer) || ![-1, 1].includes(move.direction)) {
    throw new TypeError("A move must use an outer layer and a signed quarter-turn.");
  }

  for (const cubie of getLayerCubies(cubies, move)) {
    const position = [cubie.position.x, cubie.position.y, cubie.position.z];
    const rotatedPosition = rotateVector(position, move.axis, move.direction);
    cubie.position = Object.fromEntries(
      AXES.map((axis, index) => [axis, rotatedPosition[index]]),
    );

    const rotatedStickers = {};
    for (const [face, color] of Object.entries(cubie.stickers)) {
      const nextFaceVector = rotateVector(FACE_VECTORS[face], move.axis, move.direction);
      rotatedStickers[VECTOR_FACES.get(nextFaceVector.join(","))] = color;
    }
    cubie.stickers = rotatedStickers;
  }
}

export function createScramble(length = 14, random = Math.random) {
  const moves = [];
  while (moves.length < Math.max(8, length)) {
    const axis = AXES[Math.floor(random() * AXES.length)];
    const layer = random() < 0.5 ? -1 : 1;
    const direction = random() < 0.5 ? -1 : 1;
    const previous = moves.at(-1);
    if (previous?.axis === axis && previous.layer === layer) continue;
    moves.push({ axis, layer, direction });
  }
  return moves;
}

export function invertMove(move) {
  return { ...move, direction: -move.direction };
}

export function formatMove(move) {
  const face = MOVE_FACES[`${move.axis},${move.layer}`];
  if (!face || ![-1, 1].includes(move.direction)) {
    throw new TypeError("Cannot format an invalid cube move.");
  }

  const clockwiseDirection = move.layer;
  return move.direction === clockwiseDirection ? face : `${face}'`;
}

export function isSolved(cubies) {
  for (const cubie of cubies) {
    const { x, y, z } = cubie.position;
    if (z === 1 && cubie.stickers.front !== SOLVED_COLORS.front) return false;
    if (z === -1 && cubie.stickers.back !== SOLVED_COLORS.back) return false;
    if (x === 1 && cubie.stickers.right !== SOLVED_COLORS.right) return false;
    if (x === -1 && cubie.stickers.left !== SOLVED_COLORS.left) return false;
    if (y === -1 && cubie.stickers.top !== SOLVED_COLORS.top) return false;
    if (y === 1 && cubie.stickers.bottom !== SOLVED_COLORS.bottom) return false;
  }
  return true;
}
