---
name: code-review
description: Review the currently staged changes for correctness, regressions, architectural fit, and maintainability. Use before committing changes.
disable-model-invocation: true
---

# Code review

Review only the currently staged changes.

## Scope

Run:

    git diff --cached --stat
    git diff --cached

If there are no staged changes, stop.

Use the diff to determine which files changed, then read enough surrounding code
and the applicable AGENTS.md hierarchy to understand the change.

Do not review unrelated pre-existing code unless it is necessary to establish
that a staged change causes a regression.

## Review priorities

In order:

1. Correctness and behavioral regressions.
2. Violations of documented architectural invariants or ownership boundaries.
3. Lifecycle, state, input, timing, cleanup, and concurrency mistakes.
4. Performance regressions in hot/render/simulation paths.
5. Missing or incorrect tests when behavior materially changed.
6. Documentation that became false because of the change.
7. Unnecessary complexity or divergence from established local patterns.

Do not:
- invent hypothetical problems without a concrete failure mode
- suggest broad refactors unrelated to the staged change
- complain about style already enforced by lint
- praise the change or summarize obvious code
- modify files during review

## Validation

Where useful and inexpensive, run the narrowest relevant validation:
- lint
- relevant tests
- other existing repository checks

Do not make changes merely to make validation pass.

## Output

List findings in severity order.

For each finding include:
- file and location
- concrete problem
- scenario in which it fails
- smallest reasonable correction

If there are no meaningful findings, say so plainly.

After findings, include at most a short note for any residual uncertainty or
validation that could not be performed.
