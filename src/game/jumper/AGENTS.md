# src/game/jumper - Jumper cartridge

Parent: `src/game/shared/AGENTS.md`. Root: `/AGENTS.md`.
Jumper is the most concept-dense cartridge. Read `jumper.machine.js` directly for
the state sequence (don't restate it); expect complexity there by nature, not by
accident. What follows is the non-obvious architecture.

## Generation lifecycle (the unusual part)

Level generation runs at **scene-load time** (in the generation scene's
`load()`), not in the gameloop simulate phase. Its first stage headlessly reuses
the jumper's own simulation logic to measure reachability. It has two stages and
a cache-driven re-entry. Machine `context` carries `generation` (the cached
result), `selected` (daily vs seed), and `seed`.

1. **Capabilities = a headless jumper simulation.** `capabilities.component.js`
   stands up a stubbed world (noop particles/camera, a synthetic platform
   contract) and, in its `load()`, ticks the *real* jumper physics/behavior
   through a fixed plan to measure the movement envelope (hop/blast min/max
   horizontal + vertical reach). This is deterministic headless measurement, not
   gameplay and not a gameloop frame - it answers "what jumps are physically
   reachable."
2. **Generator consumes capabilities + a seeded RNG.** `generator.component.js`
   seeds from the date hash (daily) or a specific/random seed, then places
   difficulty-scaled zones of platforms, validating each jump against the
   measured capabilities (with bounded rerolls so "hard" jumps don't come out
   trivially easy), plus coins. Output is `{ platforms, coins, seed }` per map.

**Cache + bounce-back / re-entry.** `generator.load()` emits
`notifyGame({ type: "CACHE_GENERATION", data: { maps, capabilities } })`, which
the machine assigns into `context`. Capabilities are measured in the initial
`load` scene (which includes the `capabilities` component in its order); the
later `generate` scene's order is `["generator"]` only, so it never re-measures
- `generator.load()` finds capabilities already in `context` and reuses them,
regenerating only the map. The regenerated result bounces back into `context`
again, seeding the next entry. Net effect: capabilities are measured once (the
initial load) and reused thereafter; maps are cheap and re-run on re-entry.

**Flow into entities.** The play scene's `createPlatforms` / `createCoins` read
the selected map out of `context.generation`. So generation is a simulate-phase
computation whose product lives in machine context and is consumed by gameplay
entities - not something the play entities compute themselves.

## Ownership / invariants

- **`jumper.entity/behavior.component.svelte.js`** owns the player's behavior and
  is the one place a full XState machine is **closed over inside a component**
  (jump/coyote/buffer/impact state). It exposes a few `$state` runes for UI to
  read; game logic never reads those runes back. Reserve this pattern for this
  level of complexity.
- **`physics.component.js`** is simulate-phase truth; **`render.component.js`**
  and the UI are frame-phase. Do not move gameplay decisions into frame.
- **`generation.entity/`** owns producing the level *structure* (the generated
  map data). **`platforms`** and **`coins`** own the runtime behavior over that
  structure, not just its display: `platforms` owns collision/grounding bounds
  (`bounds.component.js`, also feeding camera limits); `coins` owns collection
  (a simulate-phase `update` testing the jumper against each coin and notifying
  jumper/ui). Each also renders. They consume the map; they don't regenerate it.
- **`ui/ui.entity.svelte.js`** is the shared `ui` entity concept (see
  `src/game/shared/AGENTS.md`); Jumper's model adds score/seed/time. It crosses
  into Svelte via `withModel`.

## Constraints / gotchas (observed in code)

- Entry actions can run **before scene construction settles** and read stale
  cached data. Prefer doing per-scene setup inside `invoke` (scene/input), not
  in `entry` actions. The machine comments flag this; follow that guidance.
- UI-driven states register a `ui` input component; gameplay states register the
  jumper's input component. Match input ownership to the active state.
