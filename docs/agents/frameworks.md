# Framework idioms - Svelte 5 + XState 5 (+ xstate-component-tree)

This codebase uses the **post-rewrite** versions of Svelte and XState. Their
idioms differ sharply from the pre-rewrite versions that dominate most training
data. **Do not reach for v4 patterns.** When in doubt, copy the shape of a
golden file below rather than reconstructing API from memory.

Order of trust: **read a golden file > this cheatsheet > prior knowledge.**

---

## Golden reference files

Read the closest one before writing a new file of that kind. These were hand-
picked as clean exemplars.

| Archetype | File | What it demonstrates |
| --- | --- | --- |
| Behavioral machine | `src/nissy-girl/gesture.machine.js` | The purest machine: few deps, clear states/transitions, `meta.component` at root, routes events via `sendTo`, and the **viewmodel-mutate -> propagate-to-component** device pattern. Start here to learn machines. |
| App-flow machine + component insertion | `src/nissy-girl/device/nissy-girl.machine.js` | Device lifecycle, loading structure, **lazy-loaded cartridge machines**, and dynamic Svelte component insertion via `meta.component` (the xstate-component-tree pattern, anchored by `index.svelte` as tree root). |
| Game-flow machine (most complex) | `src/game/jumper/jumper.machine.js` | Game flow *and* UI flow in one: `invokeScene` with `simulateOrder`/`frameOrder`, `meta.load` + `withModel` to inject **dynamic props** (game data -> Svelte UI), prompt layers, nested states. The hardest file - expect complexity. |
| Viewmodel (singleton runes) | `src/nissy-girl/device/nissy-girl.viewmodel.svelte.js` (prototype), `src/nissy-girl/gesture.viewmodel.svelte.js` (minimal) | Module-scoped `$state` + a single exported object of getters/commands. The canonical viewmodel shape. |
| Reusable actor | `src/util/release-velocity.actor.js` | A reusable XState actor (here built from `fromCallback`). The release-actor flow is documented in `src/nissy-girl/device/AGENTS.md`, its only consumer. |
| Progress rune factory | `src/util/progress.svelte.js` | Rune-backed `progress` value with anchors; feeds the release actor and derives animation values. |
| Device component trio | `src/nissy-girl/device/nissy-girl.svelte` + `controls/` | The clearest **viewmodel <-> `.svelte` <-> `.mcss`** relationships. |
| Simple entity | `src/game/paint/cursor.entity.js` | Entity = factory composing component factories, returned via `createEntity`. The baseline shape. |
| Swapping sub-component | `src/game/paint/tools/tool.component.js` | A single controlling component holding a map of child objects and delegating the lifecycle to the active one (Paint's tool switching). |
| Complex behavior w/ closed-over machine | `src/game/jumper/jumper.entity/behavior.component.svelte.js` | The **only** place a full XState machine is closed over inside a component factory - the pattern for genuinely complex entity behavior. Also mixes `$state` runes with closure state. |
| ECS contracts (JSDoc) | `src/game/shared/entity/entity.js`, `.../scene.entity.js` | `Entity`/`Component`/`SceneEntity` typedefs; the unrolled simulate/frame lifecycle compilation. |

---

## Svelte 5 - use runes, never v4

| Do (v5) | Never (v4) |
| --- | --- |
| `let x = $state(0)` | `let x = 0` as reactive; `writable()`/`readable()` stores |
| `const y = $derived(expr)` / `$derived.by(() => ...)` | `$: y = expr` reactive labels |
| `$effect(() => ...)` | `$: { ... }` side-effect labels; `beforeUpdate`/`afterUpdate` |
| `let { a, b = def } = $props()` | `export let a` |
| `let { onThing } = $props(); onThing?.()` (callback props) | `createEventDispatcher()` / `on:thing` component events |
| `{@render children?.()}` + `children` prop | `<slot />` |
| `onclick={...}` | `on:click={...}` |
| `bind:value` still works | - |
| `let { x = $bindable(false) } = $props()` for two-way props | `bind:` without `$bindable` |
| `const d = $derived.by(() => ...)` for computed display | recompute inline in template every render |
| Runes outside components live in `*.svelte.js` files | stores for cross-module reactive state |

Notes:
- Viewmodels are `*.viewmodel.svelte.js`: module-level `$state` + one exported
  object. They are **global singletons** - importing gives the same instance.
- Reactive state used across modules goes in a `*.svelte.js` runes file, not a
  store.
- **Rune contracts are one-way.** A component may *expose* `$state` for the UI
  to read, but **game-level logic must never depend on runes** (frametime). See
  the Performance section in the root `AGENTS.md`.

### Svelte performance idioms (match these)

- **Static classes only:** `class={css.thing}`. Never compute/toggle/prop a
  class. State lives in `data-*` attrs targeted by CSS (see `button.svelte`).
- **Dynamic numbers via inline `style` CSS vars** fed by `$derived`
  (`style="--rotation: {deg}deg"`), not class swaps.
- **No inline objects / one-offs in hot paths** - prefer `getX()`/`getY()` over
  `getPoint() -> { x, y }`. Fewer allocations, less GC.
- **Conditional mount to drop offscreen work** (`{#if cartridges.isVisible}`).
- DOM updates are deliberate; match the local prop-vs-style-vs-element choice.

## XState 5 - use actors, never v4

| Do (v5) | Never (v4) |
| --- | --- |
| `createMachine({ ... })` | `Machine({ ... })` |
| `createActor(machine)` + `.start()` | `interpret(machine)` |
| `fromPromise`, `fromCallback`, `fromObservable`, `fromTransition` | `invoke: { src: () => promise }` bare forms, `services` |
| `invoke: { src: actorLogic }` / actor refs | `invoke: { src: "nameString" }` relying on `services` option |
| inline action fns `actions: () => vm.foo()`; `assign`, `raise`, `sendTo`, `sendParent`, `enqueueActions` | string action names + `actions` option map |
| `assign({ k : ({ context, event }) => ... })` | `assign({ k : (ctx, evt) => ... })` (positional args) |
| guards: `guard : ({ context, event }) => ...` | `cond : (ctx, evt) => ...` |
| `context : () => ({ ... })` or object | `.withContext()` |
| `createActor(m, { input })` + `input` in actors | `.withContext`/`.withConfig` |

Notes:
- Action/guard/assign callbacks take a **single object** `{ context, event, self,
  system }` - destructure it. Positional `(ctx, event)` is the v4 trap.
- Every machine should `invoke` `stateLogger` (analytics) except per-frame
  machines like `game-loop.machine.js`. See root `AGENTS.md`.
- **"Actor" vs "machine".** `fromCallback`/`fromPromise`/`fromObservable`/
  `fromTransition` are *actor logic*; `createActor(logic)` wraps logic into a
  running actor. A machine is also just actor logic: machines ARE actors.
  Naming convention: use `*.machine.js` for machine files (more meaningful) and
  `*.actor.js` for reusable non-machine actors. Today those are `fromCallback`
  actors, but other actor-logic types are fair game.

## xstate-component-tree - this replaces the router

**There is no URL router.** What would be a route/slug elsewhere is a **finite
state** here. `xstate-component-tree` walks the live machine tree and builds the
Svelte component hierarchy from state `meta`. `index.svelte` is the top of that
hierarchy and renders whatever the current statechart says.

Consequences you must respect:
- To make a *flow/route-like* component appear, put it on a **state** via
  `meta.component` (or `meta.load` for dynamic props).
- Navigation = sending events that transition states, **not** changing a URL.
- Tests and new features must be structured around the machine being the source
  of truth for flow and what's on screen.

**Nuance - not everything is a state, and not all hierarchy is machine-driven.**
Rule: fixed phase -> state; variable multiplicity -> data + a lazily-invoked
nested machine; fixed/semantic structure -> plain Svelte composition. Don't force
everything through the tree. The canonical statement (with the cartridge example
and the browsing-vs-inserted distinction) lives in root `AGENTS.md` "Semantic
branching"; the device camera/cartridge flow lives in
`src/nissy-girl/device/AGENTS.md`.

**Components send events directly to the owning machine** (`actor.send(...)`)
and hold no flow logic. Device components target the gesture/device chart (or
fire the device input singleton); game components feed the game machine via the
input actor. See `docs/agents/patterns.md`.

Two insertion forms:
- **Static component:** `meta : { component : SomeSvelteComponent }`.
- **Dynamic props:** `meta : { load : withModel(SomeComponent) }`, where a
  `withScene`/`withModel` helper resolves live data (e.g. a scene's UI model)
  and returns `[ Component, props ]`. See `withModel` in `jumper.machine.js` -
  this is how game-layer data (scene/entity/component) crosses into Svelte UI,
  which otherwise can't see it.

## Hand-driven velocity (release-actor + progress)

The app rolls its own velocity/animation (no keyframe lib) via `createProgress`
(`progress.svelte.js`) + the release-velocity actor. It is currently used only
by the device camera, so the full walkthrough lives with its consumer:
**`src/nissy-girl/device/AGENTS.md`**. The reusable generalization (directing a
global signal to a local target) is catalogued in `docs/agents/patterns.md`.

## Device render pattern (viewmodel to component)

The device shell's loop: a machine action mutates a **viewmodel** (`$state`),
Svelte `$derived`/template reads it, `.mcss` styles it. The machine never
touches the DOM; the template never holds truth. `gesture.machine.js` +
`gesture.viewmodel.svelte.js` + `camera.svelte` show this end to end.

## modular-css (.mcss) composition

Styling leans hard on **class composition**, not utility soup in markup. When a
bundle of declarations has a clear semantic responsibility, bundle it into a
utility class and `composes:` it elsewhere.

- **Shared root utilities live in `src/util/util.mcss`** and are composed by
  most `.mcss` files in the codebase. Known classes:
  - `img`: pixel-art background image (no-repeat, centered, `image-rendering:
    pixelated`).
  - `afterimg` / `beforeimg`: same, via `::after` / `::before` pseudo content.
  - `face`: `composes: img` + absolute + `backface-visibility: hidden` (a 3D
    panel face).
  - `backface` / `secondbackface`: a rotated `::after`/`::before` backface for
    double-sided 3D panels.
  - `animates`: `will-change: transform` (promote to its own layer).
  - `touchinteractive`: opt a node into pointer handling (`touch-action: none`,
    `pointer-events: auto`, no tap highlight / select).
- Animation keyframes/helpers live in `src/util/animations.mcss`.
- Reach for `composes:` from a shared class before copying declarations. Keep
  the `.mcss` import graph acyclic (modular-css forbids circular imports).
- If you add a broadly-useful class to `util.mcss`, add it to the list above so
  it stays discoverable.
