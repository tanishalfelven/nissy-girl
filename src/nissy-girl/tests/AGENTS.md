# src/nissy-girl/tests - device gesture model tests

Parent: `docs/agents/testing.md` (model-based testing architecture). Read that
first. This file covers what is specific to `nissy-girl.spec.js`: driving the
handheld shell through real pointer gestures. Other test infrastructure can
reach game states without this (e.g. the force-load path in
`nissy-girl.machine.js`), so these conventions are local to this suite.

## Physical events

- Each external event is one physical operation. Its handler performs the
  gesture and waits for motion to settle; it never branches on model state and
  never asserts the destination.
- Handlers call the named gestures in `gesture-helpers.js`; that file is the
  vocabulary of physical operations available to this suite. Its turns are in
  degrees of device rotation (dragging one device width turns 360); zoom and
  cartridge distances are in element sizes. Timing uses `FPS60` / `MAX_DT`
  (`$util/time.js`) and `MS` (`$util/time-string.js`).
- Handlers may read primitive observables (e.g. the device `--rotation`) to
  size a gesture. That is aiming a hand, not interpreting the model.
- Direction names follow the device turn: `*_LEFT` is a +x drag, `*_RIGHT` a -x
  drag.
- A gesture that moves the device into a new interaction phase must stop moving
  once the phase is reached. Further moves are input to the new phase - at full
  zoom-out with a cartridge inserted, any extra move is a swipe back out.
  Saturate a phase boundary in a single move, then release.
- Release velocity carries across phases (rotation -> zoom -> carousel). End
  turns with slow moves (one rAF frame is 16ms; dt caps at 4 frames) to bleed
  velocity before release. Progress anchors (front face, carousel center,
  cartridge in/out) stop velocity; nothing else does.
- A drag delta that crosses an anchor snaps to it and loses the rest of the
  delta. Aim turns from the observed angle at the next face, slightly past it,
  so a turn into the front lands on its anchor and later turns start from it.
- The carousel latches its browse direction from the entry glide, so the model
  records the entry side in context and models browsing relative to it.

## Time

- The clock is installed and paused before navigation (by the shared page
  fixture in `src/test/fixtures.js`); time only advances via
  `page.clock.runFor`. Pointer moves are rAF-throttled, so advance the clock
  between deliberate moves or they coalesce.
- Physical events consume test time (each settles for ~2.5s). Product timers keep
  running meanwhile: boot reaches its display at 500ms and auto-starts an
  inserted game 4s later. A state that persists across gestures must not assert
  observables that these timers change.

## State verification

- Prefer durable observables: `data-power`, device `data-cartridge`,
  `--rotation`, `--cartridgex` / `--cartridgey`, startup-screen presence.
- Prompt layers stack by push order, not by hierarchy. Assert a prompt only in a
  state where its layer is guaranteed to be on top.
- State checks run only between events, so parallel regions do not observe what
  timers do during a gesture. Prove timer-driven phases by their outcome (e.g.
  `START_GAME` reaching `inserted.playing`) rather than by transient UI.

## Browser environments

Playwright's Windows WebKit build is not representative of iOS Safari for this
app: it has no Web Audio (covered by the audio mock) and no 3D transforms
(`(-webkit-transform-3d)` is false). Rotated faces get flattened geometry and
hit testing, so taps on side or back controls miss. Treat `mobile-webkit`
failures on Windows as environment limits, not product evidence.

Linux WebKit (CI on `ubuntu-latest`, or locally under WSL2) renders and hit
tests in 3D. Run WebKit there from a Linux-side copy of the repo with its own
`node_modules`; native toolchain binaries are per-platform. Under WSL, many
parallel WebKit launches can time out at `browserType.launch`, so pass fewer
workers (e.g. `--workers=4`).

## Mocks

Every test page gets the `audio` fixture (`src/test/fixtures.js`, built on
`createAudioMock()` in `src/test/mocks/audio.mock.js`) before navigating. It
replaces Web Audio with plain objects reporting to per-test
nanospy spies (`context`, `decode`, `start`, `stop`), so all browsers run the
same audio path. `start` calls carry the sound's source `url`.

`installAudio` runs in the page as an init script, so it may reference only
browser globals and its serialized argument. Module values such as `MS` must be
passed through that argument.

A sound that an operation always plays is verified in that event, as an effect
of the action: wrap the gesture in `expectPlaysOnce` (`sfx-helpers.js`). A sound
guaranteed by a state having been reached (e.g. the boot jingle once the device
is `poweredOn`) is verified in that state. Identify sounds by their asset file
name (`SFX` in `sfx-helpers.js`).
