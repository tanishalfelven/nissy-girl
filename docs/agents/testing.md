# Testing

NissyGirl uses model-based end-to-end browser testing.

The testing architecture is intentionally non-standard:

    XState test model
        -> xstate/graph path generation
        -> Playwright browser interactions
        -> observable browser assertions

Read this document and the existing NissyGirl test model before creating,
modifying, or reorganizing tests.

## Testing stack

- Playwright is the browser/E2E runner.
- XState 5 defines behavioral test models.
- `xstate/graph` generates paths directly from those models.
- The installed package versions in `package.json` are authoritative.
- Production elements referenced by E2E tests use unique `data-testid`
  attributes. Tests should use Playwright's `getByTestId` locator for these
  stable contracts rather than generated CSS-module selectors.

Do not substitute another XState testing package or introduce a second model/path
framework without consulting the operator.

When APIs appear to disagree with this documentation, inspect the installed
package version before assuming newer/older documentation applies.

## Test models are not application machines

There are two fundamentally different uses of XState in this repository.

### Production machines

Production `*.machine.js` files:

- own application/game semantic flow
- participate in the runtime actor hierarchy
- are production sources of truth
- drive production behavior and component existence

### Test models

Test models inside `*/tests/*.spec.js`:

- are independent behavioral specifications
- exist only in the Playwright test runtime
- model the application as a user can observe and operate it
- are traversed by `xstate/graph` to generate test paths
- do not participate in application runtime
- do not import, mirror, inspect, or drive production machines

The production XState hierarchy is part of the system under test.

A test model may resemble production behavior because both describe the same
application, but they have different ownership and must remain independent.

## These are E2E models

Model tests are end-to-end browser tests, not machine unit tests.

They intentionally exercise the complete path:

    browser input
        -> DOM / Svelte controls
        -> input / gesture routing
        -> production XState
        -> viewmodels / component tree / game systems
        -> observable browser result

Do not bypass that path by:

- sending directly to production actors
- reading production actor snapshots as assertions
- mutating production context
- importing production machines into the test model
- calling production internals merely to reach a desired condition

An exception requires a concrete reason and operator agreement.

## Model scope

Test models are expected to be substantial.

Do NOT split behavior into separate models merely because conventional test
organization would place it in separate suites.

Power, orientation, cartridge browsing, cartridge insertion, controls, sound,
and game entry are connected user behaviors. Their relationships belong in the
same model when the application's observable state constrains those behaviors.

The model should express the connected behavioral state space and let graph
traversal derive the journeys through it.

Split a model only when:

- the state spaces are genuinely independent, or
- graph/path growth becomes demonstrably impractical.

Do not pre-emptively split models for organizational neatness.

## Model semantics

States represent durable externally observable conditions.

State assertions describe invariants that should be true whenever a generated
path reaches that state. Assert required prompts by their visible occurrence,
not by polling and sorting the entire prompt set: other layers may contribute
additional prompts. An assertion tied to a leaf must hold regardless of other
parallel regions. If a prompt is replaced by a later overriding layer, do not
guess its expected value from a generic parent snapshot or attach it to an
unrelated leaf; refine the modeled phase before asserting it.

Transitions represent real user/environment operations.

Transition implementations:

- encode one physical operation per event without branching on source or
  destination model state; use separate named events when the browser actions
  differ
- use Playwright to perform real browser interaction
- may wait for a browser condition needed to perform the input; assert durable
  results in the owning state callback, not in the event executor
- should not directly manipulate production application state

Examples:

- orientation may be represented as model state because it changes what the
  user can see and do
- a rotation sound may be verified while performing a rotation transition,
  because playback is an effect of the action rather than a durable state
- pointer and keyboard input may be separate transitions into the same state
  when both must provide equivalent behavior

## Path generation

The model is the test plan.

Use `xstate/graph` to derive paths from the model. Do not manually enumerate
journeys already representable by the graph.

Begin with shortest-path traversal while the model is being established.
Additional traversal strategies should be introduced deliberately when they add
meaningful behavioral coverage without pathological path growth.

A generated path is executed against a fresh real browser application.
Specs import `test` / `expect` from `src/test/fixtures.js`, not
`@playwright/test` directly. Its fixtures prepare every page before the spec
navigates: the clock is installed and paused (an installed clock otherwise
flows with wall time, making timer order depend on machine load), and Web Audio
is replaced by the `audio` fixture. Playwright config cannot run per-page
setup, so fixtures are the shared install point. Test-only mocks live in
`src/test/mocks/`; each is a factory creating an instance with nanospy spies.
Shortest paths are generated with a `serializeState` of value + context, giving
one path per model state. The `createTestModel` default also keys states by
incoming transition, which multiplies paths across parallel regions and admits
unhandled events (steps that leave state and context unchanged); do not use it.

State coverage alone does not guarantee transition coverage: a journey that ends
in a state some shorter path already reaches is never generated. Name such
journeys as `scenarios` - sequences of the same event objects `events` lists -
and add them with `getPathsFromEvents`, which validates each step against the
model. Keep scenarios to meaningful edges (e.g. ejecting a running game);
everything else stays derived by the graph.

## Prototype

`src/nissy-girl/tests/nissy-girl.spec.js` is the canonical prototype for this
testing architecture. Its gesture-driving conventions live in
`src/nissy-girl/tests/AGENTS.md`. Helpers sit beside it by concern:
`gesture-helpers.js` (physical gestures and angles), `sfx-helpers.js` (sound
assertions).

Test helpers take `(page, { ...options })`, or `({ ...options })` when they do
not touch the page. Never add positional parameters beyond `page`: positional
arguments lose their meaning fast at call sites (`drag(page, 0, 1.6, 0.15)`).
Optional options default to `false`, which destructures like an empty object.
Name magic numbers as constants by what they mean (`FRAME_MS`, `DEG_90`), and
name helpers for what they do in full (`movePointerOverFrames`, not `glide`).

Before creating another model or abstraction:

1. read this document
2. read that prototype
3. follow its established model -> graph -> Playwright structure

Prefer evolving the prototype and extracting abstractions from demonstrated
needs over inventing a generalized test framework in advance.

When the prototype establishes a reusable testing convention, document that
convention here.

## Playwright configuration is operator-owned

`/playwright.config.js` is shared testing infrastructure.

Do NOT modify it as part of implementing or repairing an individual test.

If a test appears to require changing Playwright configuration, stop and explain:

1. what behavior cannot be expressed with the current configuration
2. what configuration change is proposed
3. what other tests or environments the change may affect

Consult the operator before modifying the root Playwright configuration.

Do not work around failures by silently changing global timeouts, retries,
workers, browser projects, web server behavior, or similar shared settings.

## Documentation maintenance

Testing documentation is part of the testing architecture.

Update this document when a change:

- changes the model/path-generation architecture
- establishes or removes a reusable testing convention
- changes an operator-owned boundary
- changes dependency/API assumptions relevant to how tests are authored
- makes any statement here false or materially misleading

Do not add implementation trivia or document facts cheaply discoverable from
the test itself.

When code and documentation disagree, code/package configuration is authoritative,
but correcting stale documentation is part of the change.

If uncertain whether a discovered behavior is a durable testing convention,
do not promote it into documentation yet.