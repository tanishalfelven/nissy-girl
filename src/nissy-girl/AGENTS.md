# src/nissy-girl - interaction root + device shell

Read the root `/AGENTS.md` and `docs/agents/frameworks.md` first for stack,
conventions, and Svelte/XState idioms. This file covers how this subtree is
organized and how its pieces compose. Deeper subsystem detail lives in nested
`AGENTS.md` files (see map below).

## Ownership & boot

This subtree is the **root of the app**. The entry invariant: `src/index.js`
boots `gesture.machine.js` (NOT the device machine) and `index.svelte` renders
whatever the live component tree says.

Ownership boundaries (who is the source of truth for what):

- **`gesture`** owns interaction mode (device vs manual) and raw drag routing.
- **`device/`** owns the console and everything on-screen within it.
- **`manual/`** owns the manual mode (not yet mounted).
- **`prompts/`** owns user-facing input explanation (app-wide; see below).
- **`sound/`** owns all audio (app-wide; see below).

The rendered view (`camera.svelte`) is mounted by gesture via `meta.component`
and owns the top-level pointer surface; it holds no flow logic.

## Gesture: the interaction root

`gesture.machine.js` (`gestureActor`) is the top machine. It:

- **invokes** the device machine (`nissy-girl`, systemId `nissy-girl`) and the
  manual machine, and exposes `nissyGirlActor` via
  `gestureActor.system.get("nissy-girl")`.
- is rendered via `meta : { component : CameraComponent }`; `ComponentTree`
  feeds `statechart.setTree`, which `index.svelte` renders.
- **routes pointer drags.** `camera.svelte` wraps a `use:touch` surface that
  sends `DRAG_START` / `DRAG_DELTA` / `DRAG_END` (and the cartridge `CART_*`
  variants) to `gestureActor`, which `sendTo`s whichever interaction currently
  owns them. See the awkward-but-deliberate routing comment in the machine:
  device-camera isn't always alive, so gesture routes rather than exporting a
  sometimes-dead actor.

### Interaction modes (semantic states)

Gesture's top-level states are the interaction *modes*, with cross-fade
transition states between them:

- `device camera` - the console is in focus. Sub-states `lure` (idle attract
  animation, re-triggers on a timer) and `interacting`.
- `manual` - the manual is in focus.
- `device camera out` / `manual out` - 500ms transition states that flip focus
  (`FOCUS_DEVICE` / `FOCUS_MANUAL`) and toggle the animate flag on the gesture
  viewmodel.

`gesture.viewmodel.svelte.js` is the canonical minimal viewmodel: module-scoped
`$state` (`deviceFocused`, `doAnimate`) + an exported singleton of
getters/commands. The machine mutates it on entry/exit; components read it.

## Talking back to machines: stable actors vs event routing

Svelte components are where we send events BACK into XState. Two approaches,
both visible in `gesture.machine.js`:

- **Stable actor (preferred when available).** Export a long-lived actor a
  component can `.send(...)` to directly. `gesture.machine.js` exposes
  `gestureActor` and `nissyGirlActor` (`gestureActor.system.get("nissy-girl")`)
  because those actors are always alive. Prefer this.
- **Event routing (when an actor isn't always alive).** If an invoked actor is
  only sometimes present (e.g. `device-camera` doesn't always exist), it is NOT
  stable: don't export it. Instead send the event to the lowest-level actor
  that IS alive and let it `sendTo`/route onward. Gesture does exactly this for
  the `DRAG_*` / `CART_*` events.

Guiding bias: route specific events to specific owners; avoid making sibling
machines aware of events they don't need. Not always achievable, but aim for it.

## Prompts & app sizing

The prompt subsystem (`prompts/prompts.svelte`) is an **app-level** concern
(documented here for now). We will iterate on it a lot, so understand it well.

- **What it is:** `invokePromptLayer(id, promptLayerData)` returns an invoked
  actor (a `fromCallback`) that pushes a **prompt layer** onto a global
  `$state` stack; the top layer is the active one. Each layer is a `Map` of
  input-id -> `{ display, prompt, disable }`, where the values may be runes or
  functions, so prompts are **dynamic and contextual** (re-evaluated live).
- **Input vocabulary:** `prompts.svelte` composes device-level input consts
  (ROTATE, POWER_ON/OFF, CARTRIDGE_INSERT/EJECT, MUSHROOM) and game-level ones
  (DPAD*, BUTTON_A/B/START/SELECT) into a single `PROMPT_SOURCE` map of
  text + className. This is the one place device and gesture/game input
  vocabularies meet for user-facing explanation.
- **The rule:** nearly every `*.machine.js` invokes a prompt layer, and **any
  finite state that introduces a new gesture or device input MUST explain that
  input** via its prompt layer. New interactive states without prompts are a
  bug.

**App sizing is rem-based.** `src/index.css` sets the root `font-size` to a
viewport-relative `min(calc(80dvh / 224), calc(91vw / 142))`, so `1rem` scales
with the viewport and the entire device (and all prompts/controls) scale
uniformly. **Size everything in `rem`**, not px, so layouts hold across screens.

## Sound

`sound/` is a self-contained Web Audio system (NOT a viewmodel), app-wide but
housed at the device level (as `device/screens/` houses the screen concept).
Constraints worth knowing before touching it:

- A single lazy `AudioContext` + master gain is shared; players attach to it.
  Master gain is the one reactive hook (wired to the volume wheel).
- Per-game sound families are **co-located here on purpose** (not under each
  game) for now; don't "fix" that.
- Playback is channel-based: a channel holds at most one active sound, and a new
  play on a channel replaces the prior one.

If `sound/` grows, promote it to its own `sound/AGENTS.md`.
