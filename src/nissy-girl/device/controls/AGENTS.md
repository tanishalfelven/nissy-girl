# src/nissy-girl/device/controls - interactive controls

Parent: `src/nissy-girl/device/AGENTS.md`. Root: `/AGENTS.md`.
The device's physical controls. What matters here is the shared contract every
control obeys, not the individual files. (`button.svelte` is the reference
implementation; one component serves all face buttons, branching bean/round by
`data-type`.)

## The control contract (invariants)

- **Touch via actions:** controls use `use:controls` / `use:touch` from
  `$util/touch-action.svelte.js` for pointer handling. The dpad also reads
  `camera.viewmodel` rotation to keep tilt aligned with device rotation.
- **Input goes to the singleton:** button/dpad call
  `input.fire({ type, state })` (TRIGGERED / RELEASED) into
  `$nissy-girl/device/input.js`. They also `input.subscribe(...)` (in a
  `$effect`) to reflect pressed state back into their own visuals. Keyboard
  input flows through the same singleton, so controls stay in sync for free.
- **Static classes + `data-*`:** never toggle classes. Pressed/variant state is
  `data-type` / `data-button` / `data-right` etc., targeted in `.mcss`. Motion
  is an inline `style` transform (`translateZ(...)`, `scale(...)`) computed from
  a small derived helper.
- **Audio feedback:** controls play sfx directly via `$nissy-girl/sound/audio.js`
  on meaningful edges (e.g. button press, dpad step, volume tick).
- **No flow logic:** a control's job is to translate a pointer/key into an input
  event (or a `gestureActor.send`) and reflect its own visual state. Decisions
  live in machines.

## Dynamic deadzone (touch usability)

The dpad uses a deliberate **deadzone** technique to make touch forgiving for
thumbs. It is rarely needed elsewhere, but when a control must be easy to hit on
mobile, this is the pattern.

- `$util/touch-action.svelte.js` exports `deadzone(node, handleEvent)`, which is
  just `controls(node, { fire : noop, end : noop, handleEvent })`: a pointer
  surface that captures/consumes events but produces no input of its own.
- In `dpad/dpad.svelte` the outer `.deadzone` element (`use:deadzone`) is a
  larger ring around the actual `.interactive` dpad (see `dpad.mcss`:
  `deadzonesize = dpadhousingsize + deadzonepadding`, `border-radius: 50%`).
  Landing a thumb slightly off the pad still gets captured, so the gesture is
  not dropped.
- The inner `.interactive` element (`use:controls`) does the real work:
  `storeDpadState` normalizes the pointer to -1..1 relative to the pad's live
  rect, and `handleInput` only fires a direction once the pointer passes a
  center `DEADZONE` threshold (with a `DIAGONAL_RATIO` to bias cardinal vs
  diagonal). So there are two deadzones: the outer **capture ring** and the
  inner **center dead area**.
- The pad rect is recomputed when device `rotation.progress` changes, since
  rotation changes the pad's on-screen size, hence "dynamic" deadzone.

When building a new touch control that needs thumb tolerance, reuse `deadzone`
for the capture ring rather than enlarging the interactive element itself.

## 3D/CSS note

Each control is a pile of perspective panels (see root readme). When editing
`.mcss` here, preserve the `translateZ` plane variables and `transform-style:
preserve-3d` chains - they are what make the control read as 3D. Prefer tweaking
CSS custom properties over restructuring the DOM.
