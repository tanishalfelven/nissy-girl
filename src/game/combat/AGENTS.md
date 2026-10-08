# src/game/combat - Combat cartridge (WIP)

Parent: `src/game/shared/AGENTS.md`. Root: `/AGENTS.md`.

> Status: **not shipped.** `GAME_COMBAT_ID` is commented out of `gameOrder` in
> `src/game/games.js`. `combat.machine.js` is a minimal `loading` -> `menu`
> shell that invokes a single character scene (`frameOrder: ["render"]`) plus
> input. Expect this to grow; keep this guide updated as it does.

## The real concept: the skeleton system

Combat's reason to exist is a **2D skeletal character** with **4 cardinal
facings** whose bones resolve per facing. The pieces:

- **Build-time:** `build/vite-plugin-aseprite-skeleton-atlas.js` compiles an
  Aseprite source into skeleton data (bones, joints, textures, per-facing
  resolution) consumed at runtime. This is the most complex build plugin; treat
  its output as the contract.
- **Runtime (`src/game/util/skeleton/`):** `skeleton.component.js` builds bones
  (Pixi `Sprite`s) and joints from that data plus a `pose`; `skeleton.pose.js`
  holds poses; `skeleton.animator.js` drives them; `resolvers/` resolve
  appearance per facing/direction (`depth`, `side`). `character.entity.js` wires
  this into an entity.

## Invariants to preserve

- Facing is resolved, not authored per-frame: a direction maps to a resolved set
  of bones/depth ordering. Don't hardcode per-facing sprites.
- The skeleton is rendered in the **frame** phase; any combat gameplay state
  belongs to simulate once it exists.
- Skeleton data shape is owned by the build plugin; runtime code should adapt to
  it, not fork its own format.
