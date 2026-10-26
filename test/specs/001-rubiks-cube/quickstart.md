# Quickstart: Animated Rubik's Cube

## Prerequisites

- A current desktop or mobile browser.
- No package installation or build step is required.

## Run locally

From the repository root, start any static HTTP server (for example, `npx serve .` if Node.js is installed) and open the reported local URL. Alternatively, open `index.html` directly in a browser that supports JavaScript modules.

## Validate the main flows

1. Load the page and confirm the cube appears solved, colorful, and three-dimensional.
2. Drag across the cube with a mouse or touch and confirm the view changes while sticker colors remain fixed.
3. Activate **Scramble** and confirm at least eight face turns are visibly animated and leave a mixed arrangement.
4. While a sequence is active, confirm Scramble and Solve cannot start a conflicting sequence.
5. Activate **Solve** and confirm the cube animates back to six uniform faces.
6. After scrambling, confirm a numbered list of inverse turns appears, with prime marks explained; during Solve, confirm the active step and completed steps update alongside the animations.
7. Repeat using keyboard navigation and activation; confirm focus remains visible and controls have clear accessible names.
8. Enable the operating system's reduced-motion preference and confirm state changes and completion feedback remain clear.
9. Resize to 360px wide and confirm the cube, solve steps, and both primary controls remain visible and usable without horizontal scrolling.

## Expected outcome

The cube starts solved, Scramble produces a valid mixed state, and Solve reverses that scramble with animated quarter-turns. See [data-model.md](./data-model.md) for state and move rules.
