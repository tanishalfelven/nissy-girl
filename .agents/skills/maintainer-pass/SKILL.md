---
name: maintainer-pass
description: >
  Refine working, recently changed code as a repository-native maintainer would.
  Infer local conventions from repeated codebase evidence, simplify unnecessary
  abstraction, improve clarity and naming, remove wasted work, and scrutinize
  performance-sensitive paths without changing intended behavior. Use after an
  implementation is working, or when asked to clean up, simplify, polish,
  remove AI slop, improve clarity/performance, or make a change feel native to
  the codebase.
metadata:
  version: "0.1.0"
---

# Maintainer Pass

Refine working code so it looks deliberate, direct, and native to this repository.

This is not a feature-development pass and not a generic style review. Act like a
maintainer who already knows this codebase and is cleaning up an implementation
before accepting it.

The repository decides what "good code" means. Generic best practices are
secondary.

## Preconditions

Prefer to run after the implementation's relevant behavior is working.

If validation is currently failing:

- continue when the failures are known, pre-existing, or explicitly outside the
  cleanup scope;
- otherwise do not disguise correctness work as cleanup. Identify the blocker
  before refactoring around it.

Never weaken tests or checks to make a cleanup pass succeed.

## Determine scope

Use the narrowest meaningful scope:

1. explicit files or paths supplied by the user;
2. otherwise the current staged and unstaged change;
3. otherwise code changed by the immediately preceding implementation work.

Inspect surrounding code when necessary to understand the change, but do not
turn a scoped cleanup into a repository-wide refactor.

## Learn the local implementation style

Before editing:

1. Read the applicable repository instructions for the changed files.
2. Read the diff and the complete changed functions/components/modules.
3. Inspect callers and ownership/lifecycle boundaries when they affect the
   implementation.
4. Find a small number of nearby or analogous implementations.
5. Determine whether the changed code is cold setup code, ordinary application
   code, reactive/UI code, or a performance-sensitive hot path.

Infer conventions from repeated evidence.

One example is an example, not a convention. Prefer patterns that recur across
multiple relevant files or are explicitly documented as intentional.

Use this order of authority:

1. current code and architectural invariants;
2. applicable repository guidance;
3. repeated nearby patterns;
4. generic language/framework practices.

Do not rewrite distinctive local code into generic framework style merely
because another style is more conventional elsewhere.

## Review lenses

Apply all of these lenses to the scoped change.

### Native fit

Ask whether the implementation looks like the surrounding repository.

Look for:

- naming inconsistent with the local vocabulary;
- ownership placed in the wrong object, machine, component, or layer;
- control flow that ignores guarantees already provided by the architecture;
- new representations for concepts that already have an established shape;
- generic framework idioms where the repository uses a deliberate local idiom.

Prefer existing local shapes when they express the same concept cleanly.

Do not cargo-cult incidental syntax from one neighboring file.

### Directness

Remove accidental complexity.

Look especially for:

- one-use wrappers and helpers;
- helper chains that obscure a primitive operation;
- naked boolean parameters;
- generalized APIs created for one or two concrete cases;
- unnecessary indirection;
- duplicated or derivable state;
- defensive checks against conditions the architecture already guarantees;
- deeply nested control flow that can be expressed directly;
- abstractions created in anticipation of hypothetical future requirements.

Prefer explicit local code until an abstraction has a real semantic concept to
represent.

Do not extract code merely because two blocks look similar. Shared code should
represent shared meaning, not visual resemblance.

Small intentional duplication is preferable to the wrong abstraction.

### Reuse

Search for existing primitives before adding another implementation of an
established concept.

Reuse code when:

- it represents the same semantic operation;
- its ownership and lifecycle fit the new call site;
- reuse makes the implementation easier to understand.

Do not force unrelated concepts through one helper merely to reduce duplication.

### Altitude

Check whether the change is implemented at the correct architectural level.

A special case layered onto a general mechanism may indicate that the real
change belongs deeper in the system.

Conversely, do not generalize a local requirement into shared infrastructure
without evidence that the shared abstraction owns the concept.

Prefer the smallest layer that can express the invariant naturally.

### Clarity

Optimize for the next maintainer reading the code.

Prefer:

- meaningful names from the repository's existing vocabulary;
- straightforward control flow;
- explicit primitive operations when composition obscures intent;
- functions whose purpose is evident without tracing several helpers;
- comments that explain constraints, invariants, or non-obvious reasons.

Remove:

- comments that merely narrate the code;
- conversation/history comments;
- stale explanations;
- names that describe implementation mechanics instead of the concept.

Do not optimize for minimum line count.

### Performance

Treat performance according to where the code runs.

For hot paths, frame loops, simulation, input, rendering, reactive updates, DOM
updates, high-frequency callbacks, and repeated operations, scrutinize:

- avoidable allocations;
- repeated computation or lookups;
- unnecessary iteration;
- redundant DOM/reactive writes;
- work occurring at a higher frequency than necessary;
- avoidable async/IO serialization;
- unnecessary object creation or conversion;
- lifecycle mistakes that keep work alive longer than needed.

For cold setup, tooling, tests, and rarely executed paths, prefer clarity unless
there is concrete evidence of a meaningful performance problem.

Do not perform speculative micro-optimization.

Do not make code substantially harder to understand for an unmeasured gain.

When clarity and performance genuinely conflict in a hot path, preserve the
performance-sensitive implementation and make its reason legible.

### Tests

Treat tests as executable specifications.

Prefer direct setup, interaction, and assertion code over a miniature framework
inside the test suite.

Apply a higher bar to test helpers than production helpers: extract only when
the repeated operation has clear shared meaning and the helper makes the test
easier to understand.

Avoid permissive assertions or generalized matchers that make it unclear what
behavior a test actually proves.

Never improve test readability by weakening coverage.

### Documentation

Update documentation only when this change makes an existing durable statement
false or misleading.

Do not create documentation for:

- one-off implementation details;
- ordinary language idioms;
- facts immediately obvious from nearby code;
- a cleanup performed once.

Record a new pattern only when repeated evidence shows that it is a reusable
repository convention or architectural constraint.

## Editing policy

Make high-confidence, behavior-preserving improvements directly.

Bias toward:

- deletion;
- fewer concepts;
- fewer layers;
- clearer ownership;
- existing primitives;
- direct expressions of architectural invariants;
- less repeated runtime work.

Do not:

- change intended product behavior;
- redesign public APIs without explicit permission;
- add dependencies for cleanup;
- perform unrelated legacy cleanup;
- introduce speculative architecture;
- rewrite working code solely to make it different;
- expand the diff substantially for a marginal improvement.

If apparently awkward code protects a constraint you do not yet understand,
investigate before removing it.

If a cleanup would require a product or architectural decision rather than a
behavior-preserving implementation choice, leave it unchanged and report it.

## Validate incrementally

After a coherent cleanup, run the narrowest relevant validation when practical.

Before completion, run the repository's normal completion checks for the
changed scope.

Fix failures introduced by this pass.

Do not modify, skip, or weaken validation merely to obtain green output.

## Completion test

Before finishing, reread the resulting diff as though you did not write it.

Ask:

- Is each abstraction earning its existence?
- Does ownership match the surrounding architecture?
- Is the control flow easier to understand?
- Did the change introduce a new concept where an existing one would do?
- Is duplicated state or work still present?
- Are hot paths doing only the work they need?
- Did cleanup accidentally make any code cleverer?
- Does this look like it belongs in this repository?

If another behavior-preserving edit clearly improves the answer, make it and
validate again.

Stop when further changes would be subjective churn rather than a meaningful
improvement.

## Report

Keep the final report brief.

State:

- the meaningful structural or clarity improvements made;
- any material performance improvements;
- anything suspicious you intentionally left unchanged because changing it
  would require a behavioral or architectural decision;
- validation performed.

Do not narrate every edit.
