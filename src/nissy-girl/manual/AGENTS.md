# src/nissy-girl/manual - manual mode (STUB)

> Status: **not yet publicly mounted.** `<Manual />` is currently commented out
> in `camera.svelte`. This stub marks the concept; expand it when the manual
> stabilizes.

Parent: `src/nissy-girl/AGENTS.md`. Root: `/AGENTS.md`.

The manual is a sibling **interaction mode** to the device camera - the gesture
machine (`gesture.machine.js`) cross-fades focus between `device camera` and
`manual` via `FOCUS_DEVICE` / `FOCUS_MANUAL`.

Pieces:

- `manual.machine.js` - the manual's own flow: `viewing` -> `curling` ->
  `settling` (a page-curl drag that animates back via `getAnimateProgress`).
  Routes `DRAG_*` from the gesture machine.
- `manual.viewmodel.svelte.js` - rune-backed drag/page state.
- `manual.data.js` / `manual.consts.js` - page content/config (data-only).
- `manual.svelte` / `page.svelte` (+ `.mcss`) - the view.

## Caution

`manual.svelte` is currently regarded as **too complex** and is an active
simplification target. Do **not** treat it as an exemplar to copy. If you work
here, prefer reducing complexity, and update this stub into a real guide once
the shape settles.
