# NissyGirl - Agent Guide

NissyGirl is a web-based 3D handheld game console rendered **entirely in HTML/CSS**
(perspective + `translateZ`, no Three.js / no WebGL scene) that hosts swappable
game "cartridges". What looks 3D is a pile of `<div>`s and perspective tricks.

This file is the top-level orientation. Subsystems have their own nested
`AGENTS.md` files that go deeper - see the map below. Parent files explain how
pieces relate; child files explain how a piece works internally. When editing in
a subtree, read its nearest `AGENTS.md` first.

## Stack

- **Svelte 5** (runes) for all UI/templating.
- **XState 5** for state/behavior modeling (device, interactions, games).
- **xstate-component-tree** maps live statechart state -> rendered Svelte tree.
- **PixiJS 8** for the in-cartridge game canvas (render loop is hand-driven).
- **modular-css** (`.mcss`) for scoped styles, co-located with components.
- **Vite 8** build; deployed via Cloudflare (`wrangler`).

## Reactive dataflow

The core loop the whole app follows:

```
XState machine  ->  viewmodel (.svelte.js runes)  ->  .svelte template
      ^                                                     |
      +--------------  DOM pointer / keyboard events  <-----+
```

Machines own truth. Viewmodels expose rune-backed getters/commands. Templates
render runes and attach listeners that send events back into machines.

## Top-level layout

- `src/index.js` - boot entry. Mounts `index.svelte` and imports
  `$nissy-girl/gesture.machine.js` (starting the root statechart).
- `src/index.svelte` - renders the live component tree from
  `statechart.getTree()`.
- `src/nissy-girl/` - the device + its interaction shell. **Root of the app.**
  See `src/nissy-girl/AGENTS.md`.
- `src/game/` - the cartridge game runtime and the cartridges themselves.
  See `src/game/shared/AGENTS.md` and per-cartridge guides.
- `src/util/` - shared primitives: animation/velocity (`progress.svelte.js`,
  `release-velocity.actor.js`, `velocity.js`, `animate-progress.js`),
  `touch-action.svelte.js`, XState/rune helpers, math, random, and **`time.js`
  (the `rafLooper` primitive)**. `rafLooper` is the shared RAF driver behind
  both the release-velocity actor and the gameloop machine - one dt-normalized
  loop abstraction reused for velocity resolution and frame simulation.
- `build/` - **custom Vite plugins** (project-local build pattern). Currently
  they bridge **Aseprite -> PixiJS**: animation data, packed atlas, and a
  **skeleton atlas** builder. The skeleton builder is complex and tied to
  `src/game/combat/`: it compiles a dynamic skeleton resolver for a 2D character
  with **4 cardinal facings** and a set of bones resolved per facing. New
  asset->engine bridges belong here as Vite plugins. Custom ESLint rules live
  in `build/lint/`.
- `src/test/` - shared Playwright test infrastructure: `fixtures.js` (the
  `test` / `expect` every spec imports) and `mocks/`.

Device-level systems worth knowing early (each is its own world; nested guides
to come): **`src/nissy-girl/device/input.js`** (device input, distinct from
touch/gesture) and **`src/nissy-girl/sound/`** (audio system). Both sit at the
device level but are effectively app-wide, mirroring how `device/screens/`
owns the screen concept.

### Reference docs (read these for framework specifics)

- `docs/agents/frameworks.md` - **Svelte 5 + XState 5 + xstate-component-tree
  idioms**, anti-pattern tables (never use v4 patterns), and the list of
  **golden reference files** to copy the shape of. Read before writing a
  machine, viewmodel, component, entity, or actor.
- `docs/agents/patterns.md` - a living catalog of reusable idioms found in this
  codebase. Scan it before implementing something non-trivial, and **add to it**
  when you discover or reuse a pattern worth remembering.
- `docs/agents/testing.md` - required reading before working on tests. Testing
  uses large Playwright E2E models whose paths are generated with `xstate/graph`;
  these test models are deliberately separate from production `*.machine.js`.

### AGENTS.md map

- `/AGENTS.md` (this file) - overview, stack, conventions, commands.
- `/src/nissy-girl/AGENTS.md` - gesture interaction root; how device / manual /
  prompts / sound compose.
- `/src/nissy-girl/device/AGENTS.md` - the console shell (machine/viewmodel/
  template loop, device-camera, cartridge, screens).
- `/src/nissy-girl/device/controls/AGENTS.md` - shared control patterns (buttons,
  dpad, touch-action, input middleware).
- `/src/nissy-girl/manual/AGENTS.md` - the manual mode (stub; not yet mounted).
- `/src/nissy-girl/tests/AGENTS.md` - device gesture model tests (physical
  events, test time, state verification).
- `/src/game/shared/AGENTS.md` - gameloop, scene/ECS, simulate-vs-frame orders.
- `/src/game/{paint,jumper,combat}/AGENTS.md` - individual cartridges.
- `/build/lint/AGENTS.md` - local ESLint rules (every rule must autofix).

## Conventions

### File naming (semantic suffixes)

- `*.machine.js` - XState machine definition (+ often the actor + exports).
- `*.viewmodel.svelte.js` - rune-backed state bridging a machine to templates.
- `*.svelte.js` - a runes module (reactive state outside a component).
- `*.component.js` - a game ECS component (lifecycle: `load`/`update`/etc).
- `*.entity.js` / `*.entity/` - a game entity (folder when it has components).
- `*.actor.js` - a standalone XState actor (e.g. `fromCallback`).
- `*.consts.js` - constants / IDs / enums.
- `*.svelte` + co-located `*.mcss` - component + its scoped styles.
- `*/tests/*.spec.js` - Playwright E2E test models. These may use XState, but
  they are NOT production `*.machine.js` files. See `docs/agents/testing.md`.

### Path aliases

Defined in `vite.config.js` (and usable in `.mcss` via composes/@value):

- `$game` -> `src/game`
- `$nissy-girl` -> `src/nissy-girl`
- `$util` -> `src/util`

### Language: JavaScript only

This codebase is **plain JavaScript - no TypeScript, no build-time type
checking.** This is intentional. Correctness comes from **deterministic,
closure-scoped code** and from **XState modeling flow explicitly**, not from the
type system. XState statecharts make many type guarantees unnecessary because
invalid states simply aren't reachable. JSDoc typedefs are used to *document*
contracts (e.g. `Entity`, `Component`, `SceneEntity`), not to enforce them.
Do not introduce TypeScript or type-driven refactors.

### Code style (enforced by eslint `@stylistic`; run `npm run lint`)

- Tabs for indent; Unix line endings; double quotes; semicolons.
- **Spaces around object-literal colons**: `{ id : foo }`, `{ type : "X" }`.
- Arrow parens always: `(x) => ...`.
- Use `_` for intentionally unused or empty callback parameters instead of `{}`.
- Array bracket spacing: `[ A, B ]` (but not for arrays-in-arrays /
  objects-in-arrays).
- `operator-linebreak` before (except `=` after); `1tbs` braces.
- **No space after** `import`/`export`/`const`/`let` and control keywords:
  write `if(...)`, `for(...)`, `while(...)`. `return `/`else ` keep a trailing
  space. This is enforced - don't fight it.
- No unused imports (auto-fixable).
- Variable declarations form their own group: a blank line before and after a
  run of `const` / `let` (auto-fixable).
- Value changes (assignments, `++` / `--`) form their own group the same way
  (`build/lint/padded-assignments.js`, auto-fixable).
- Comments sit on their own line above the code, after a blank line (no
  trailing `code(); // comment`).
- No `!!`; write `Boolean(x)`.
- Define before use: anything referenced must be declared above the reference
  (`no-use-before-define`).
- Multiline object properties are separated by a blank line
  (`build/lint/padded-multiline-properties.js`, auto-fixable).
- In test files, a call computes at most one arithmetic argument inline, and
  exports come last (`import-x/exports-last`; see `docs/agents/patterns.md`).
- No IIFEs, always prefer a named extracted function if an inline scope is necessary.

### Core patterns (prescriptive)

**No classes. Ever.** Everything is built from **factory functions** that return
functions and/or collections of child objects expressing pieces of
functionality. Factories close over their state (closure scope *is* the private
state) and expose an object of methods. This is the single most pervasive
pattern in the codebase - `createEntity`, `createMovement`, `createScene`,
`createDirection`, etc. Entities and components follow it strictly: closure
scope pairs data with behavior and gives natural entry/exit + code-splitting
points for large structures. Some entities/components also hold runes.

File archetypes (keep these honest - the suffix is a contract):

- **Utility files** - live in a `util/` dir (there are several; root
  `src/util/`, also `src/game/util/`). Mostly `export const someFunc = ...`
  collections of pure-ish helpers.
- **Actor files** - a reusable XState actor, named `*.actor.js`. If you find a
  reusable actor *not* using this name, flag it - renaming it is pre-approved.
- **Component** - a `*.svelte` + a co-located `*.mcss`, **always paired**.
- **Utility CSS** - a `*.mcss` in a shared/common location that other places
  import directly (via `composes` / `@value`). **modular-css has no circular
  imports**, so shared CSS must be structured as a clean dependency tree.
- **Const files** - like utility files but the point is *data* (IDs, enums,
  config); incidental functions are fine but aren't the purpose.
- **Svelte rune files** (`*.svelte.js`) - reactive state outside a component.
  All viewmodels are these; some utilities are too.
- **Viewmodels** (`*.viewmodel.svelte.js`) - a set of **global** runes composed
  into a single exported object. Effectively a **singleton** bridging a machine
  to templates.

Other load-bearing patterns:

- **Registries as `Map`s** with lazy dynamic `import()` (see `src/game/games.js`).
- **Shared contracts, multiple implementations** - e.g. the `movement` component
  contract is implemented by both the in-game cursor and the UI navigator.
- **Hand-driven animation** via a generalized `progress` rune + a single
  velocity source (`release-velocity.actor.js`) rather than a keyframe library.
- **No IIFEs**. Prefer exposed named functions.

Framework-specific shapes (runes, machines, actors, component-tree wiring) live
in `docs/agents/frameworks.md`. Prefer copying a golden file over recalling API.
The canonical Svelte 5 viewmodel prototype is
`src/nissy-girl/device/nissy-girl.viewmodel.svelte.js`.

### Performance (load-bearing - not optional polish)

High performance is a primary design constraint, especially **game frametime**.

- **Game-level code NEVER depends on Svelte runes.** Runes are an opaque
  reactive black box; keeping them out of the game simulation protects
  frametime. Rune *contracts* flow **one way only** - a component like
  `behavior.component.svelte.js` may *expose* `$state` for the UI to consume,
  but game logic must never *read* runes to make decisions. UI being slower or
  processed separately is fine; the game loop is not.
- **Avoid inline objects / one-offs** in hot paths. This is why the codebase
  prefers `getX()` / `getY()` over returning `getPoint() -> { x, y }` - fewer
  allocations, less GC pressure. Follow this habit.
- **DOM updates are deliberate and minimal.** The `nissy-girl` tree is full of
  intentional choices about *how* an element updates (prop vs style vs element
  presence). Match the local approach; don't add churn.
- **Conditional mounting is expected** - a subtree renders only when it
  *semantically* exists. This is primarily about correctness; dropping the
  offscreen DOM is a secondary bonus. (See "Semantic branching" below for why
  the cartridge is a `{#if}`, not a state.)

### Testing

Testing has its own architecture and conventions. If modifying or creating tests,
read the nearest test-specific `AGENTS.md` before proceeding. Do not load testing
documentation for unrelated work.

### CSS & DOM

- **Never** dynamically compute, toggle, or pass classes as props. A class is
  static: `class={css.thing}`. Classes are **composed** (modular-css
  `composes`) and express generalized, reusable concepts.
- **Semantic meaning is carried by `data-*` attributes**, written directly and
  targeted from CSS - e.g. `data-type={type}`, `data-power={isPowered}`,
  `data-right="true"`. `button.svelte` is the reference. Toggle *state* via
  data-attrs + CSS, never via class juggling.
- Dynamic numeric values go through **inline `style` CSS custom properties**
  fed by `$derived` (e.g. `style="--rotation: {deg}deg"`), not per-element class
  swaps.
- Keep the **DOM minimal**; prefer CSS for structure/appearance. Respect the
  `browserslist` in `package.json` (baseline widely available; Safari >= 16.4).
- modular-css has **no circular imports** - shared `.mcss` must form a clean
  dependency tree.

### Component -> machine event flow

Components send interactions **directly to the owning machine**; they hold no
flow logic. There are two channels (detail lives in the nested guides):

- **Device level** sends to the device/gesture statechart and/or fires the
  device input singleton. See `src/nissy-girl/device/AGENTS.md`.
- **Game level** input is routed through the shared input actor to entity
  components. See `src/game/shared/AGENTS.md`.

Note: not *all* hierarchy is machine-driven. Some structural composition lives
inside components deliberately (e.g. `camera.svelte` hosts NissyGirl/Manual;
`nissy-girl.svelte` conditionally hosts the cartridge).

**Semantic branching - finite states model real, fixed concepts.** A new concept
becomes a nested machine; its states are genuine phases of that concept. Things
that are *dynamic/variable* do NOT become states: the device can hold any of N
cartridges and one can be inserted even outside cartridge-browsing, so "which
cartridge" is **data**, not a route. A cartridge's real continuation is its own
lazily-loaded **game machine**; the Svelte `{#if}` that mounts the cartridge
visual is just the representation of "something is inserted," not the game. Rule
of thumb: if it's a fixed phase, model it as state; if it's variable
multiplicity, keep it dynamic (data + a lazily-invoked nested machine).

### Complexity

Keep an eye toward simplicity; flag/resist growing complexity. `manual.svelte`
is currently considered *too complex* and is an active simplification target -
don't treat it as an exemplar to copy.

### State, events, and error handling

- **The statechart is the source of truth.** True state changes live at the
  XState level. `xstate-component-tree` derives the rendered Svelte component
  hierarchy directly from live machine state - **this is integral to all app
  flow.** New features, UI flows, and tests must be structured around this.
  Machine states own semantic app-flow and the *existence* of flow/route-like
  components: if a component's presence is a semantic phase of the app, a state
  should put it there. This does not mean every component comes from a state -
  fixed structural composition and representations of dynamic data are ordinary
  Svelte composition (see "Semantic branching" above).
- **Statechart events and transitions are always SCREAMING_SNAKE_CASE**
  (`DRAG_START`, `REQUEST_MANUAL`, `GAME_TICK`).
- **Error handling is intentionally thin** and generally interpreted at the
  statechart level (error events / transitions) rather than via try/catch
  scattered through logic. Prefer modeling the failure as a state/event.

### Machines are the app map (read them first)

`*.machine.js` files are the most instructive artifacts in the codebase. Treat
the machine tree as the app's directory: to understand a feature, read its
machine before its components. The machine is declarative, semantic flow and is
more expressive than a router.

The operative invariant for agents:

- **A machine's guarantees are invariants you may presume downstream.** If a
  component is mounted by a given state (`meta.component`/`meta.load`), then
  while it is alive you may presume **state membership holds** (the app is in
  that state) and its **entry actions have already run**. Do not over-read this:
  transition guards describe the conditions under which a transition *fired*,
  not standing truths, and `context` is mutable and may change while the
  component is alive. Presume only what the machine actually guarantees for the
  duration of that state; trace the component back to its mounting state to see
  which facts those are.
- Navigation and "what can happen next" are answered by a machine's transitions,
  not by scattered conditionals. Start at `src/nissy-girl/gesture.machine.js`
  (the root) and follow `invoke`d machines down into the feature you care about.
- When adding behavior, express the constraint in the machine so it becomes a
  presumable invariant, rather than guarding defensively in components.

### Analytics & logging

Analytics are routed through a Cloudflare Worker and emitted from
`src/util/state-logger.actor.js`. Convention: **every machine invokes
`stateLogger`** so its state flow is reported as analytics. The one deliberate
exception is `game-loop.machine.js`, which disables this (per-frame logging
would be far too spammy). When you add a new machine, include `stateLogger`
unless it ticks every frame.

Deployment is a plain SPA on Cloudflare Pages + a Worker. You should not need to
touch deploy config; it "just works." The only app-relevant piece is the
analytics path above.

## Commands

- `npm run dev` - Vite dev server (`:3000`, host `0.0.0.0`).
- `npm run build` - production build.
- `npm run preview` - preview the build.
- `npm run lint` - ESLint (`./src`) + Stylelint (`./src/**/*.mcss`). Run before
  considering a change done.
- `npm run test:chrome` - Run playwright e2e tests on desktop Chromium only.
- `npm run test:all` - Run every browser project in WSL via
  `playwright.wsl.js` (see `src/nissy-girl/tests/AGENTS.md`).

## Completion criteria

Before reporting a task complete:

- run the narrowest relevant validation for the change
- run `npm run lint`
- fix failures introduced by the change
- do not weaken, skip, or modify checks merely to make validation pass
- if pre-existing failures prevent a clean run, report them explicitly and
  distinguish them from failures introduced by the current change

Do not report a task complete while lint is failing because of your changes.

## Grounding rule for agents

Source order of truth: **code > `AGENTS.md` > `readme.md`.** The `readme.md` is
human-authored narrative and will drift behind the code. These `AGENTS.md`
files are meant to be kept *more* up to date than the readme - when a change
makes a doc wrong, fixing the doc is part of the change. If a doc disagrees with
the code, the code wins.

This repo reorganizes structurally (both the device tree and the game runtime
have been reshaped). Prefer re-reading the relevant subtree over trusting
remembered structure.

### Documentation maintenance

Agent documentation is part of the repository and should evolve with the code.

When making a change, update the nearest relevant `AGENTS.md` or `docs/agents`
document if the change:

- makes an existing statement false or materially misleading
- changes an architectural invariant, ownership boundary, lifecycle, or convention
- establishes or removes a reusable pattern
- changes an operator-owned constraint agents need to know
- changes the canonical example for an established pattern

Do not document implementation trivia or facts cheaply discoverable from nearby
code. Prefer updating the narrowest relevant document rather than adding detail
to the root guide.

If uncertain whether something is a durable convention, leave it undocumented
until repeated use establishes it.

## Writing these docs (meta-convention)

These `AGENTS.md`/`docs/agents` files are **ASCII-only**. Do not use smart
quotes, em/en dashes, unicode arrows, box-drawing, or other non-ASCII glyphs.
Use `-` for dashes, `->` / `<-` / `<->` for arrows, `>=` for inequalities,
straight `"` and `'` for quotes, `...` for ellipsis. This keeps exact-match
editing reliable; non-ASCII punctuation has repeatedly broken edits. If you
add content, match this style, and normalize any stray non-ASCII you touch.
