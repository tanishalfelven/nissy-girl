# src/nissy-girl/device - the console shell

Parent: `src/nissy-girl/AGENTS.md` (gesture root). Root: `/AGENTS.md`.
This is the device itself - everything the gesture machine puts in focus as the
"console." The device machine is invoked by gesture; it does not run standalone.

## Ownership

- **`nissy-girl.machine.js`** owns device lifecycle (power, boot, game handoff)
  and is the invariant source for everything below it.
- **`device-camera.machine.js`** owns the rotate/zoom/cartridge interaction and
  the velocity it produces (`rotation`/`zoom`/`camera` runes). It is NOT always
  alive (only while the device is in focus); treat it as unstable per the
  gesture doc's actor rules.
- **`cartridge/`** owns cartridge-browsing *data* (not the game).
- **`screens/`** owns the single Pixi renderer the game draws into.
- **`input.js`** owns device input state (see "Device input" below).
- Viewmodels bridge these machines to templates; the canonical Svelte 5
  viewmodel prototype is `nissy-girl.viewmodel.svelte.js`.

## Device lifecycle (`nissy-girl.machine.js`)

States: `initializing` (loads audio via `fromPromise`, may branch to force-load
a game from a URL param) -> `off` -> `poweredon` -> `booting` -> `game`.

Key patterns here:

- **Component insertion:** the boot screen is attached to a state via
  `meta : { component : StartupScreenComponent }` (static form). This is the
  xstate-component-tree pattern; `index.svelte` is the tree root.
- **Lazy cartridge game machines:** when a game starts, the chosen cartridge's
  game machine is dynamically imported (via the `games` registry) and invoked
  as a nested machine. The cartridge game's real continuation lives there, NOT
  in a finite device state (see "Semantic branching" in `/AGENTS.md`).
- **Prompt layers:** `invokePromptLayer(id, [...])` surfaces contextual hints
  tied to the current state (e.g. power-on, rotate).
- Reads device truth from `nissy-girl.viewmodel.svelte.js` via plain function
  calls in actions/guards; the machine never touches the DOM.

## Device-camera flow (`device-camera.machine.js`)

Models the rotate -> zoom -> cartridge interaction chain. `REQUEST_MANUAL` is
`sendParent({ type : "FOCUS_MANUAL" })` (the device can only hand off to the
manual while actually in play, hence the gesture<->device ping-pong). Any phase
of the chain is reversible/cancelable (swipe back), by design.

### The release-velocity + progress pattern (canonical home)

This is the hand-rolled velocity/animation system (no keyframe library). It is
currently used **only here, in the device camera**, so the full explanation
lives in this file; `docs/agents/frameworks.md` and `patterns.md` point here.

Two pieces:

- **`createProgress(...)`** (`$util/progress.svelte.js`): a rune-backed value in
  `[0,1]` with `anchors` (stop points), `update(delta)` (mutating), `project`
  (pure projection of a delta), and a `velocity` config. Downstream `$derived`
  runes turn the raw progress into meaningful transforms (rotation deg, zoom
  translate, cartridge position).
- **`createReleaseVelocity(id, eventName)`** (`$util/release-velocity.actor.js`):
  a reusable `fromCallback` actor holding the **single velocity source**. It
  receives raw `DRAG_START` / `DRAG_DELTA` / `DRAG_END` (sampling velocity,
  echoing each back as `eventName` + a `delta`), and on release runs a
  `rafLooper` that projects the active progress toward its anchors, emitting
  `eventName` deltas until it settles on an anchor.

How the machine drives it:

- At root it `invoke`s `createReleaseVelocity(ROTATE_VELOCITYID, "ROTATE_SWIPE")`
  and forwards the raw `DRAG_*` events to it with `sendTo`.
- On entering each state it **retargets** the single velocity source at a
  different progress via
  `updateVelocityTarget(target, progress) = sendTo(target, { type : "NEW_TARGET", progress })`:
  `rotation` in `playing`, `zoom` in `zooming`, the cartridge progresses while
  browsing. That retarget-on-entry is what lets velocity carry continuously
  across phases (fling rotation -> keep gliding into zoom).
- The actor emits `ROTATE_SWIPE` (and the machine `raise`s `HANDLE_DRAG` etc.),
  which the state handlers apply to the active progress via `progress.update`.

This is the concrete instance of the general "direct a global signal to a local
target" shape in `patterns.md` (here: swipe -> whichever progress is active).

## Cartridge (`cartridge/`)

`cartridge.viewmodel.svelte.js` is the cartridge **data** layer:

- `cartridgeX` / `cartridgeY` are `createProgress(...)` instances (anchors +
  velocity configs) driving the browse/insert drag.
- `cartridges` singleton: `isVisible` (gated by `camera.backfaceHidden` - hidden
  when facing away), current index/direction, show/hide, selection.

Remember: the cartridge is dynamic multiplicity, not a route. The `{#if
cartridges.isVisible}` in `nissy-girl.svelte` is just the visual of "something
inserted/browsable," not the game.

## Screens (`screens/`)

The bridge between the game runtime and PixiJS:

- `screen.svelte` owns the `<canvas>`; `render.js` lazily builds a
  `WebGLRenderer` (nearest-neighbor scaling for pixel art) and exposes
  `screen.render(renderables)` / `screen.clear()`.
- The gameloop machine calls `screen.render(...)` each frame with the scene's
  renderable. The render loop is hand-driven; Pixi is just the rasterizer.

## Device input (`input.js`)

The **device input singleton** is a plain object (NOT runes), distinct from
touch/gesture. Invariants/constraints:

- It is the single source of pressed-input truth; both touch controls and
  keyboard feed the same singleton, so they can never disagree.
- It only notifies subscribers on real edge transitions (press/release), never
  on redundant repeats. `releaseAll` fires on blur/visibility loss so inputs
  can't get stuck held.
- Downstream routing (dataflow):
  `controls -> input singleton -> game input actor -> entity input component`.
  The game actor wakes the gameloop only when input actually needs a frame
  (see `src/game/shared/AGENTS.md`).

## Template conventions in this tree

This tree is the densest place the device DOM conventions from `/AGENTS.md` are
applied (static composed classes, `data-*` state, CSS-var motion via `$derived`,
events straight to `gestureActor`/`input`, no flow logic in components). Use
`nissy-girl.svelte` and `controls/` as the worked examples; the rules live in
root, not here.
