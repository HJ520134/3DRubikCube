import {
  CUBIE_STEP,
  SOLVED_COLORS,
  TURN_DURATION,
  applyMove,
  createScramble,
  createSolvedCube,
  formatMove,
  getLayerCubies,
  invertMove,
  isSolved,
} from "./cube.js";

const world = document.querySelector("#cube-world");
const stage = document.querySelector("#cube-stage");
const scrambleButton = document.querySelector("#scramble-button");
const solveButton = document.querySelector("#solve-button");
const moveCounter = document.querySelector("#move-counter");
const cubeState = document.querySelector("#cube-state");
const actionStatus = document.querySelector("#action-status");
const solveGuide = document.querySelector("#solve-guide");
const solveSteps = document.querySelector("#solve-steps");
const solveGuideCount = document.querySelector("#solve-guide-count");
const solveGuideHint = document.querySelector("#solve-guide-hint");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const cube = createSolvedCube();
const cubieElements = new Map();
const faceNames = Object.keys(SOLVED_COLORS);

let isBusy = false;
let scrambleHistory = [];
let turnCount = 0;
let viewX = -22;
let viewY = -35;
let dragOrigin = null;

function createCubieElement(cubie) {
  const element = document.createElement("div");
  element.className = "cubie";
  element.id = `cubie-${cubie.id}`;
  element.setAttribute("aria-hidden", "true");

  for (const face of faceNames) {
    const sticker = document.createElement("span");
    sticker.className = `sticker-face sticker-face--${face}`;
    sticker.dataset.face = face;
    element.append(sticker);
  }

  return element;
}

function renderCube() {
  for (const cubie of cube) {
    let element = cubieElements.get(cubie.id);
    if (!element) {
      element = createCubieElement(cubie);
      cubieElements.set(cubie.id, element);
      world.append(element);
    } else if (element.parentElement !== world) {
      world.append(element);
    }

    const { x, y, z } = cubie.position;
    element.style.transform = `translate3d(${x * CUBIE_STEP}px, ${y * CUBIE_STEP}px, ${z * CUBIE_STEP}px)`;
    for (const sticker of element.children) {
      const color = cubie.stickers[sticker.dataset.face];
      sticker.classList.toggle("has-sticker", Boolean(color));
      sticker.style.setProperty("--sticker-color", color ?? "transparent");
    }
  }
}

function updateView() {
  world.style.setProperty("--view-x", `${viewX}deg`);
  world.style.setProperty("--view-y", `${viewY}deg`);
}

function setBusy(busy) {
  isBusy = busy;
  scrambleButton.disabled = busy;
  solveButton.disabled = busy;
  stage.setAttribute("aria-busy", String(busy));
}

function updateCounter() {
  moveCounter.innerHTML = `${String(turnCount).padStart(2, "0")} <span>MOVES</span>`;
}

function renderSolveGuide(moves, activeIndex = -1) {
  solveSteps.replaceChildren();
  solveGuide.hidden = false;
  solveGuideCount.textContent = `${String(moves.length).padStart(2, "0")} TURNS`;

  moves.forEach((move, index) => {
    const notation = formatMove(move);
    const step = document.createElement("li");
    const number = document.createElement("span");
    const symbol = document.createElement("span");
    const faceNames = { U: "top", D: "bottom", R: "right", L: "left", F: "front", B: "back" };
    const face = faceNames[notation[0]];
    const direction = notation.endsWith("'") ? "counterclockwise" : "clockwise";

    step.className = "solve-step";
    step.dataset.step = String(index);
    step.setAttribute("aria-label", `Step ${index + 1}: turn the ${face} face ${direction}`);
    if (index < activeIndex) step.classList.add("is-complete");
    if (index === activeIndex) {
      step.classList.add("is-active");
      step.setAttribute("aria-current", "step");
    }

    number.className = "solve-step-number";
    number.textContent = String(index + 1).padStart(2, "0");
    symbol.className = "solve-step-move";
    symbol.textContent = notation;
    step.append(number, symbol);
    solveSteps.append(step);
  });

  if (activeIndex < 0) {
    solveGuideHint.textContent = "Follow the turns in order. A ′ means turn that face counterclockwise.";
  } else if (activeIndex >= moves.length) {
    solveGuideHint.textContent = "All done — every step is back in place.";
  } else {
    solveGuideHint.textContent = `Turn ${String(activeIndex + 1).padStart(2, "0")} of ${String(moves.length).padStart(2, "0")} · ${formatMove(moves[activeIndex])}`;
  }
}

function getRotationFunction(axis) {
  return `rotate${axis.toUpperCase()}`;
}

async function animateMove(move, index, total, action) {
  const slice = document.createElement("div");
  slice.className = "turn-layer";
  const rotatingCubies = getLayerCubies(cube, move);
  for (const cubie of rotatingCubies) {
    slice.append(cubieElements.get(cubie.id));
  }
  world.append(slice);

  const rotation = getRotationFunction(move.axis);
  const angle = 90 * move.direction;
  const duration = reducedMotion.matches ? 110 : TURN_DURATION;
  const animation = slice.animate(
    [
      { transform: `${rotation}(0deg)` },
      { transform: `${rotation}(${angle}deg)` },
    ],
    {
      duration,
      easing: "cubic-bezier(0.24, 0.72, 0.18, 1)",
      fill: "forwards",
    },
  );

  cubeState.textContent = `${action} · ${index + 1} / ${total}`;
  await animation.finished;
  applyMove(cube, move);
  slice.remove();
  renderCube();
  turnCount += 1;
  updateCounter();
}

async function playSequence(moves, action, onStep) {
  if (isBusy) return false;
  if (moves.length === 0) return true;

  setBusy(true);
  cubeState.textContent = `${action} in progress`;
  actionStatus.textContent = `${action} started.`;
  try {
    for (let index = 0; index < moves.length; index += 1) {
      onStep?.(index);
      await animateMove(moves[index], index, moves.length, action);
    }
    return true;
  } catch (error) {
    console.error("Cube animation failed.", error);
    actionStatus.textContent = "The cube could not complete that move. Please try again.";
    cubeState.textContent = "Something went wrong";
    return false;
  } finally {
    setBusy(false);
  }
}

scrambleButton.addEventListener("click", async () => {
  if (isBusy) return;
  solveGuide.hidden = true;
  solveSteps.replaceChildren();
  const moves = createScramble();
  const completed = await playSequence(moves, "Mixing");
  if (!completed) return;

  scrambleHistory = moves;
  const solutionMoves = [...moves].reverse().map(invertMove);
  renderSolveGuide(solutionMoves);
  cubeState.textContent = "Nicely mixed";
  actionStatus.textContent = `Scramble complete. ${moves.length} turns mixed the cube.`;
  world.setAttribute("aria-label", "Scrambled Rubik's Cube. Drag or use arrow keys to change the viewing angle.");
});

solveButton.addEventListener("click", async () => {
  if (isBusy) return;
  if (scrambleHistory.length === 0) {
    cubeState.textContent = "Already home";
    actionStatus.textContent = "The cube is already solved.";
    return;
  }

  const moves = [...scrambleHistory].reverse().map(invertMove);
  renderSolveGuide(moves);
  solveGuide.scrollIntoView({ block: "nearest", behavior: reducedMotion.matches ? "instant" : "smooth" });
  const completed = await playSequence(moves, "Putting it back", (index) => {
    renderSolveGuide(moves, index);
  });
  if (!completed) return;

  renderSolveGuide(moves, moves.length);
  scrambleHistory = [];
  cubeState.textContent = isSolved(cube) ? "Back where it belongs" : "Almost there";
  actionStatus.textContent = isSolved(cube)
    ? "Solved. Every side is back to one color."
    : "The solve sequence finished, but the cube is not solved.";
  world.setAttribute("aria-label", "Solved Rubik's Cube. Drag or use arrow keys to change the viewing angle.");
});

stage.addEventListener("pointerdown", (event) => {
  if (event.button !== 0 || isBusy) return;
  dragOrigin = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
  stage.setPointerCapture(event.pointerId);
  stage.classList.add("is-dragging");
});

stage.addEventListener("pointermove", (event) => {
  if (!dragOrigin || dragOrigin.pointerId !== event.pointerId) return;
  viewY += (event.clientX - dragOrigin.x) * 0.58;
  viewX = Math.max(-75, Math.min(75, viewX - (event.clientY - dragOrigin.y) * 0.48));
  dragOrigin = { ...dragOrigin, x: event.clientX, y: event.clientY };
  updateView();
});

function stopDragging(event) {
  if (!dragOrigin || dragOrigin.pointerId !== event.pointerId) return;
  dragOrigin = null;
  stage.classList.remove("is-dragging");
}

stage.addEventListener("pointerup", stopDragging);
stage.addEventListener("pointercancel", stopDragging);
stage.addEventListener("lostpointercapture", stopDragging);

world.addEventListener("keydown", (event) => {
  const step = event.shiftKey ? 14 : 8;
  if (event.key === "ArrowLeft") viewY -= step;
  else if (event.key === "ArrowRight") viewY += step;
  else if (event.key === "ArrowUp") viewX = Math.max(-75, viewX - step);
  else if (event.key === "ArrowDown") viewX = Math.min(75, viewX + step);
  else return;

  event.preventDefault();
  updateView();
});

updateView();
renderCube();
updateCounter();
