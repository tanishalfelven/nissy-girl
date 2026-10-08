# Patterns catalog (agent-maintained)

A living list of reusable idioms discovered in this codebase. Purpose: avoid
re-scanning 12kloc to rediscover how something is conventionally done.

**How to use this file:**
- Before implementing something non-trivial, scan here for an existing idiom.
- When you discover or reuse a pattern that seems reusable, **add an entry.**
- Keep entries short: name, one-line intent, a canonical reference file, and any
  gotcha. Link to `docs/agents/frameworks.md` for framework-specific shapes.
- If a pattern turns out to be wrong/outdated, correct or remove it - code wins.

Entry template:

```
### <pattern name>
- Intent: <one line>
- Reference: <path(s)>
- Gotcha: <optional>
```

---

## Established patterns

### Factory + closure as "class"
- Intent: Pair state and behavior without classes; closure scope is the private
  state, return an object of methods (+ sometimes `$state` runes).
- Reference: `src/game/shared/entity/entity.js`, `src/util/progress.svelte.js`.
- Gotcha: No `class`/`this` anywhere. Expose getters, not raw fields.

### Viewmodel singleton
- Intent: Bridge a machine to templates via module-scoped `$state` + a single
  exported object.
- Reference: `src/nissy-girl/gesture.viewmodel.svelte.js`.

### Lazy registry (Map + dynamic import)
- Intent: Register swappable units keyed by id, loaded on demand.
- Reference: `src/game/games.js`.

### Component insertion via state meta
- Intent: Put UI on screen by attaching it to a machine state, not by ad-hoc
  mounting.
- Primitive: `meta.component` (static component) and `meta.load` returning
  `[ Component, props ]` (dynamic props). The `[ component, props ]` tuple is
  the real primitive.
- Reference: `src/nissy-girl/device/nissy-girl.machine.js`. See
  `docs/agents/frameworks.md`.
- Note: `withModel` (in `jumper.machine.js`) is NOT the primitive; it's a
  game-level convenience that resolves the scene's UI-model entity and returns
  `[ Component, { model } ]`. Orthogonal to the insertion mechanism itself.
- Gotcha: This is the router. No URLs.

### Directing a global signal to a local target
- Intent: Take a broad/global signal (a swipe/gesture, raw input) and point it
  at whatever local target currently owns it (a progress velocity target, an
  entity's input component). The owner is swapped by the machine; the signal
  source stays single and global.
- Reference (velocity): `src/util/release-velocity.actor.js` +
  `src/util/progress.svelte.js` (machine sends `NEW_TARGET` on state entry to
  retarget). Full walkthrough: `src/nissy-girl/device/AGENTS.md`.
- Reference (input): `src/game/shared/input.actor.js` (directs input at the
  active entity component): the same shape. See the input-routing entry below.
- Gotcha: velocity version is currently device-camera-only.

### Simulate/frame split (fixed timestep)
- Intent: Advance game logic in fixed `GAME_TICK` steps (consistent across
  refresh rates), render once per RAF with an interpolation `alpha`.
- Reference: `src/game/shared/entity/scene.entity.js`,
  `src/game/shared/game-loop.machine.js`.

### Shared component contract, multiple implementations
- Intent: One component interface, different behaviors (e.g. `movement` used by
  both the in-game cursor and the UI navigator).
- Reference: `src/game/shared/component/movement.component.js`.

### Component-order bundles (simulate/frame)
- Intent: A scene composes entities, each entity bundles components, each
  component bundles lifecycle functions; the scene declares a canonical
  `simulateOrder` / `frameOrder` and the per-frame work is compiled from that.
- Reference: `src/game/shared/entity/scene.entity.js` (unrolling),
  per-cartridge `*.machine.js` `invokeScene({...})` calls.
- Note: This is an "enforced by usage" convention that emerged as the reliable
  way components, their functions, and ordering compose across the game layer.

### Closed-over machine for complex behavior
- Intent: When entity behavior is genuinely stateful, close a full XState
  machine inside the component factory.
- Reference: `src/game/jumper/jumper.entity/behavior.component.svelte.js`.
- Note: One-off / rare; worth knowing but not something you'd invent unprompted.
  Reserve for real complexity; simple components stay plain closures.

### rafLooper primitive
- Intent: One **lazy-by-default** dt-normalized RAF loop abstraction, reused
  across the app. Idle until started; stops itself when the loop fn returns
  falsy.
- Reference: `src/util/time.js` (`rafLooper`; also `calcDt`, `rafThrottle`).
- Gotcha: `func(dt, session)` keeps running while it returns truthy. The
  release-velocity actor and the gameloop machine are both built on it.

### Input routing (device singleton to game actor to entity)
- Intent: Route physical/keyboard input from device controls down to the entity
  that currently owns input, without entities knowing about the DOM.
- Reference: `src/nissy-girl/device/input.js` (global `input` singleton; plain
  object, NOT runes), `src/game/shared/input.actor.js` (directs input at
  registered component targets; analogous to release-velocity/progress
  indirection), `src/game/shared/component/input.component.js` (entity-side
  interpretation + direction resolvers).
  Routing chain: controls -> input singleton -> input actor -> entity component.
- Gotcha: Controls call `input.fire(...)`; the input actor fans events to
  components' `handleInput()` and only wakes the gameloop when a frame is needed.

### Static class + semantic data-attr styling
- Intent: Keep classes static and composed; express state through `data-*`
  attrs written directly and targeted in CSS.
- Reference: `src/nissy-girl/device/controls/button/button.svelte`,
  `src/nissy-girl/device/nissy-girl.svelte`.
- Gotcha: NEVER compute/toggle/prop a class. Dynamic numbers go through inline
  `style` CSS custom properties fed by `$derived`.

### Allocation-averse accessors
- Intent: Reduce GC pressure in hot paths by avoiding inline objects/one-offs.
- Reference: `getX()`/`getY()` over `getPoint()` returning `{ x, y }` throughout
  the game/entity code.

### Cartridge `{#if}` - two distinct reasons (behavior + perf)
- Intent: `{#if cartridges.isVisible}` in `nissy-girl.svelte` gates the cartridge
  for two separate reasons, not one:
  1. **Behavioral/semantic:** nothing should show when not in cartridge-select
     and no cartridge is inserted (ordinary conditional mounting; see root
     `AGENTS.md` "Semantic branching" - it is a `{#if}`, not a state).
  2. **Performance:** while a game is in play, the cartridge's backface-enabled,
     3D-transformed faces can overlap the game `<canvas>`. Leaving them mounted
     behind a frequently-rendering canvas thrashes browser z-index/compositing,
     so unmount them. This is NOT generic frustum culling - it is the specific
     3D-CSS-over-canvas cost.
- Reference: `{#if cartridges.isVisible}` in `nissy-girl.svelte`
  (`cartridges.isVisible` gated by `camera.backfaceHidden`).
- Gotcha: deliberate structural composition inside a component (not everything is
  machine/`meta`-driven).
