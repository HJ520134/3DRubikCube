# Data Model: Animated Rubik's Cube

## Cube

Represents the puzzle's current physical sticker arrangement.

| Field | Type | Validation / Meaning |
|-------|------|----------------------|
| cubies | Collection of 26 visible cubies | Each cubie occupies a unique position in the 3×3×3 lattice except the internal core. |
| position | Integer coordinate `(x, y, z)` | Each coordinate is `-1`, `0`, or `1`; a legal quarter-turn permutes cubies in one outer layer. |
| orientation | Face direction mapping | A turn rotates all affected face directions consistently with their positions. |
| solved | Boolean derived state | True only when every face's nine stickers match its solved color. |
| busy | Boolean interaction state | True while a scramble or solve sequence is being animated; no other sequence may start. |

## Sticker

Represents one colored facelet on a cubie.

| Field | Type | Validation / Meaning |
|-------|------|----------------------|
| homeFace | One of six faces | Remains fixed as the sticker's solved color identity. |
| currentFace | One of six directions | Changes when its cubie is turned. |
| color | One of six puzzle colors | Determined by `homeFace`; rotations never change sticker color. |

## Move

Represents one quarter-turn of an outer layer.

| Field | Type | Validation / Meaning |
|-------|------|----------------------|
| axis | X, Y, or Z | Defines the layer orientation. |
| layer | `-1` or `1` | Identifies an outer layer; the center layer is not independently turned. |
| direction | `-1` or `1` | Defines the signed quarter-turn direction. |

Inverse of a move preserves its axis and layer and negates its direction. A scramble is an ordered sequence of at least eight legal moves; its inverse sequence is played in reverse order to solve.

## Interaction State

Presentation state contains the cube's viewing angle and pointer-drag origin. It is separate from `Cube` and cannot change stickers. `busy` gates both Scramble and Solve controls during move-sequence playback.
