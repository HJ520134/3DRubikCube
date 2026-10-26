# Tasks: Animated Rubik's Cube

**Input**: Design documents from `specs/001-rubiks-cube/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated test suite was requested; use the runnable browser validation scenarios in `quickstart.md`.

## Phase 1: Setup

**Purpose**: Establish the dependency-free static page structure.

- [X] T001 Create the semantic page structure, accessible controls, and module entry point in `index.html`
- [X] T002 [P] Create the responsive visual theme, cube stage, and reduced-motion styles in `styles.css`

## Phase 2: Foundational

**Purpose**: Implement the shared legal cube representation used by rendering, scrambling, and solving.

- [X] T003 Implement the 26 visible cubies, six sticker colors, and solved-state initialization in `cube.js`
- [X] T004 Implement legal quarter-turn position and sticker-direction permutations for X, Y, and Z outer layers in `cube.js`
- [X] T005 Implement DOM rendering of the cube and pointer/touch viewing rotation in `app.js`

**Checkpoint**: The page opens to a solved, draggable 3D-looking cube; story work can proceed.

## Phase 3: User Story 1 - View and manipulate the cube (Priority: P1)

**Goal**: Display the solved, colorful cube and allow view-only pointer/touch rotation.

**Independent Test**: Load `index.html`, confirm the sticker grid and visible depth, then drag the cube and confirm only its view changes.

- [X] T006 [US1] Render each cubie as separated, colored face stickers in the 3D stage in `app.js`
- [X] T007 [US1] Apply and constrain pointer/touch drag to update view rotation without mutating cube state in `app.js`
- [X] T008 [US1] Ensure the solved cube and interaction stage fit narrow viewports from 360px in `styles.css`

**Checkpoint**: The solved cube is visually clear, responsive, and independently inspectable.

## Phase 4: User Story 2 - Scramble the cube (Priority: P1)

**Goal**: Animate a valid sequence of at least eight face turns into a visibly mixed state.

**Independent Test**: Activate Scramble, observe at least eight face turns, and verify the resulting sticker arrangement is not solved.

- [X] T009 [US2] Generate a sequence of at least eight legal outer-layer turns without consecutive redundant same-layer turns in `cube.js`
- [X] T010 [US2] Animate each layer turn, update cubie positions and sticker directions, and serialize active sequences in `app.js`
- [X] T011 [US2] Wire Scramble to play a new sequence and retain its move history in `app.js`
- [X] T012 [US2] Disable both primary controls during playback and announce progress/completion accessibly in `app.js` and `index.html`

**Checkpoint**: Scramble visibly produces a mixed, valid cube state; duplicate actions cannot overlap.

## Phase 5: User Story 3 - Solve the cube (Priority: P1)

**Goal**: Animate inverse turns to restore the scramble-generated state to solved.

**Independent Test**: Scramble, activate Solve after playback completes, and confirm all six faces return to one color.

- [X] T013 [US3] Generate the inverse of a move by preserving axis/layer and reversing its direction in `cube.js`
- [X] T014 [US3] Play the stored scramble moves in reverse order to animate Solve and clear history when complete in `app.js`
- [X] T015 [US3] Keep Solve safe and clear when the cube is already solved in `app.js`
- [X] T016 [US3] Format all six faces and turn directions as standard notation in `cube.js`
- [X] T017 [US3] Show the ordered solution and synchronize active/completed steps with Solve playback in `index.html` and `app.js`
- [X] T018 [US3] Style the responsive solve guide and document its notation and validation flow in `styles.css` and `specs/001-rubiks-cube/quickstart.md`

**Checkpoint**: Solving returns the cube to its exact initial sticker arrangement.

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify accessibility, motion preferences, and complete user journeys.

- [X] T019 [P] Honor reduced-motion preferences with shortened turn transitions and visible completion feedback in `styles.css` and `app.js`
- [X] T020 [P] Verify keyboard focus, accessible control labels, and live sequence status in `index.html` and `app.js`
- [X] T021 Run every responsive, drag, scramble, solve, step-guide, busy-state, keyboard, and reduced-motion scenario in `specs/001-rubiks-cube/quickstart.md`

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1) has no prerequisites.
- Foundational (Phase 2) depends on the page shell and styles from Setup and blocks story implementation.
- User Story 1 depends on foundational model/render wiring.
- User Story 2 depends on the rendered cube and shared legal turn model.
- User Story 3 depends on User Story 2's stored scramble history.
- Polish depends on all user stories.

### User Story Dependencies

- **US1**: Starts after Phase 2; no dependency on another story.
- **US2**: Starts after Phase 2; uses the shared cube view from US1.
- **US3**: Starts after US2; requires a generated move history to reverse.

### Parallel Opportunities

- T002 can proceed independently of T001 once the page's visual direction is established.
- T006 and T009 modify different files and can proceed in parallel after the foundation.
- T016 and T017 can proceed in parallel after the sequence UI is in place.

## Parallel Example: User Stories

```text
# After the foundational model and page entry point:
T006: Render colored cubie stickers in app.js
T009: Generate legal scramble moves in cube.js

# During final polish:
T016: Add reduced-motion behavior in styles.css and app.js
T017: Verify keyboard and live-status accessibility in index.html and app.js
```

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Setup and Foundational phases.
2. Complete User Story 1 and verify solved rendering and view-only drag independently.
3. Add animated scrambling, then inverse-history solving.
4. Complete accessibility and responsive validation from `quickstart.md`.

### Incremental Delivery

Each phase leaves a usable page: first the solved cube, then a scrambled cube, then a reversible solve flow. Keep all movement local to the page and avoid introducing build or runtime dependencies.
