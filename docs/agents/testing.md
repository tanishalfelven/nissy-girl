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
path reaches that state.

Transitions represent real user/environment operations.

Transition implementations:

- use Playwright to perform real browser interaction
- may verify transient effects caused by that operation
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

## Prototype

`src/nissy-girl/tests/nissy-girl.spec.js` is the canonical prototype for this
testing architecture.

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