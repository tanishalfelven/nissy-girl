# src/game/paint - Paint cartridge

Parent: `src/game/shared/AGENTS.md`. Root: `/AGENTS.md`.
Paint was the first cartridge; it exists to stress-test the runtime. Read
`paint.machine.js` directly for the state sequence - it is the map of this
feature and cheaper to read than to restate here.

## Lazy-loop exemplar

Paint is the cleanest example of the lazy-loop architecture: there is no
continuous animation, so frames are driven **directly by input**. The cursor
fires on input events and tool work/rendering happens in response; when nothing
is happening, the loop sleeps. Use Paint as the reference when reasoning about
"what wakes the loop": here it is almost entirely input.

## Ownership / invariants

- **`artboard.entity.js`** owns the pixel buffer. Tools draw into
  `artboard.getContext()`; that context is the single source of pixel truth, and
  edits are committed (`pixels.commit()`) on stroke boundaries for undo-style
  snapshots.
- **`cursor.entity.js`** owns the on-screen cursor: composes `movement` +
  `input` + `tool`. Invariant: position rounds to the grid whenever direction
  changes (gridded drawing feel).
- **`tool.component.js`** owns the active tool and swaps between
  `pencil`/`line`/`bucket` (in `tools/`). One controller delegates the lifecycle
  to the active tool only. This single-controller swap is paint-specific; don't
  generalize it elsewhere.
- **`camera.component.js`** owns zoom; cursor speed is derived from zoom.
- UI (`ui/`) is the shared `ui` entity concept (see
  `src/game/shared/AGENTS.md`), mounted via state `meta`.

## Phase discipline

Tool work that changes pixels is gameplay truth and belongs to the simulate
path; rendering the cursor/preview is frame-phase. Keep that split intact when
adding tools.
