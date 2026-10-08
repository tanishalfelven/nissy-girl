# src/game/shared - the cartridge game runtime

Root: `/AGENTS.md`. This subtree is the engine every cartridge builds on. A
cartridge is a game machine (see `src/game/<name>/`) that invokes this runtime.

## Cartridge machines are game-flow maps

App-level machines (`src/nissy-girl`) express app/UI flow. **Cartridge machines
express game flow**: the machine as a whole is the semantic map of that game's
lifecycle. They may contain UI states (menus, pause, scoring), but those are
still part of the game's lifecycle, not app routing.

**Every cartridge machine invokes `gameloop` at its root.** This is the backbone
of the lazy-loop architecture: the loop exists for the whole game lifetime but
does not run continuously - components and input *request* work (a frame),
rather than assuming a running loop. Keep that request-driven relationship when
adding states or entities.

## Ownership (who is the source of truth)

- **`game-loop.machine.js`** owns the *game's* frame scheduling and budget
  (when the game simulates/renders). It does not own `requestAnimationFrame`
  exclusively: it drives frames through the shared `rafLooper` primitive
  (`$util/time.js`), which other code also uses (e.g. the release-velocity
  actor, `rafThrottle`). Ownership here is of game scheduling, not of RAF.
- **`scene.actor.js` + `entity/scene.entity.js`** own entity composition and the
  compiled per-frame update order.
- **`entity/world.entity.js`** owns the entity registry, the Pixi container
  surface, world bounds, and the bridge back to the game machine (`notifyGame`,
  injected `context`).
- **`input.actor.js` + `component/input.component.js`** own routing device input
  to whichever entity component currently handles it.
- Game logic owns its own state in plain closures. It **must not depend on
  runes** (frametime); see `/AGENTS.md` Performance.

## Lifecycle (invariants)

1. A game machine invokes `gameloop` at its root and waits for `GAME_READY`
   before loading a scene. (The device/screen must exist first.)
2. `invokeScene({...})` builds the scene, registers it to the gameloop
   (`REGISTER_SCENE`), and emits `SCENE_READY` once `scene.load()` resolves.
   Treat the scene as usable only after `SCENE_READY`.
3. On actor stop, the scene is removed from the gameloop and destroyed. Scenes
   clean up their own Pixi containers.

**Single active scene.** Only one scene is alive at a time. `scene-action.js`
caches it in a module singleton (`storedScene`) so machine actions can reach the
live scene; the gameloop also holds it. Do not assume multiple concurrent
scenes.

## The frame: simulate vs frame (data flow)

The gameloop keeps an accumulator and runs **two distinct phases per RAF**,
compiled from two orderings the scene is given:

- **`simulateOrder` -> `scene.simulate(GAME_TICK)`** runs in a fixed-timestep
  loop (`while(acc >= GAME_TICK && steps < MAX_SIMULATION_STEPS)`), so game logic
  advances in consistent ticks regardless of refresh rate. This is where
  gameplay state changes.
- **`frameOrder` -> `scene.frame(dt, alpha)`** runs once per RAF with an
  interpolation `alpha = acc / GAME_TICK` for smooth rendering between ticks.
  This is where rendering/interpolation happens; it must not mutate gameplay
  truth.

`createScene` pre-unrolls each order into flat `[entity, fn]` arrays per
lifecycle. `load`/`stop`/`destroy`/`hasUpdate` are **shared** across both
phases; only `update` is split into simulate vs frame. Keep a component's
`simulate` work authoritative and its `frame` work presentational.

## Lazy loop (constraint)

The loop is **lazy**: it does not run every frame by default. Work must *request*
a frame. The gameloop only steps when a scene reports `hasUpdate`, or when input
or a `sceneAction` sends `START`. If something animates but nothing wakes the
loop, that is the bug. `scene-action.js`'s `sceneAction(fn)` forces a frame
after a machine action unless `fn` returns `false`; `withScene(fn)` just hands
the action the live scene without forcing a frame.

## Entities, components, world (contracts)

- Entities are factories returning `createEntity({ id, components })`; components
  are factories exposing lifecycle fns (`load`/`start`/`stop`/`destroy`/
  `hasUpdate`/`update`) as available. See `entity/entity.js` for the contract.
- Entities reach siblings through the world: `world.world.get("<id>")`. The
  world injects itself onto each entity (`entity.world`) on `add`.
- Shared contracts live in `component/` (e.g. `movement`, `input`). The same
  contract may have different implementations across entities/cartridges - treat
  the contract, not the implementation, as the stable thing.
- Rendering: a component exposing `render.getRenderable()` has its Pixi object
  attached to the world surface; `world.getScreen()` is what the device screen
  renders each frame.

## UI entity (shared runtime concept)

Cartridges each define a `ui` entity (`paint/ui/paint-ui.entity.svelte.js`,
`jumper/ui/ui.entity.svelte.js`, ...). These are a **shared architectural
concept/convention**, not a single enforced interface. What the code actually
shares across them:

- A `ui`-id entity that bridges game-layer state to Svelte: it holds `$state`
  runes and exposes a `ui` component with a `getModel()` returning a rune-backed
  model. (Runes flow one way out to UI; game logic never reads them back.)
- Navigation built from `createInput` -> `createUINav` (`src/game/shared/ui/`):
  an input component resolves a direction and drives the nav component.
- The model crosses into Svelte via a `meta.load` that returns
  `[ Component, { model } ]` (from `getModel()`).

What is NOT shared (do not generalize): Jumper defines a `withModel` helper that
wraps that `meta.load` shape; Paint inlines the same `[ Component, { model } ]`
via `withScene` instead. The input-component registration id also differs per
cartridge. Treat the shape as conventional, the `withModel` helper as
Jumper-specific.

## Input (other half of the device chain)

Device input arrives here via `invokeInput` (proxies raw input events and fans
them to registered component targets) and `invokeInputComponent(id, resolver)`
(registers a specific entity's input component). The component's `handleInput()`
reads global input state and returns whether it changed; a change wakes the
gameloop. Full chain: device controls -> device input singleton -> this input
actor -> entity input component. See `src/nissy-girl/device/AGENTS.md`.

(The `ui` entity's input component is the UI-side consumer of this chain; the
gameplay entity's input component is the gameplay-side one. Which is registered
depends on the active state.)

## Per-cartridge guides

- `src/game/paint/AGENTS.md`
- `src/game/jumper/AGENTS.md`
- `src/game/combat/AGENTS.md`
