---
name: agent-doc-maintenance
description: Review, compress, and maintain repository agent documentation such as AGENTS.md. Use after agent docs have accumulated, after architectural discovery, or when documentation is becoming repetitive or expensive to load.
---

# Agent documentation maintenance

Treat this as documentation compression and consistency work, not architecture discovery.

## Goals

- Remove repetition.
- Remove facts cheaply discoverable from nearby code.
- Preserve:
  - invariants
  - ownership boundaries
  - lifecycle guarantees
  - architectural rationale
  - non-obvious constraints
  - canonical examples
  - navigation pointers
- Place each fact at the narrowest scope where it remains useful.
- Prefer deleting or shortening text over adding text.

## Scope rules

- Root agent docs contain repo-wide architecture, conventions, and navigation.
- Shared subsystem docs contain shared contracts and lifecycle rules.
- Feature-specific facts remain local.
- Do not duplicate machine/state flow when the machine itself is cheaper and clearer to read.
- Link to a canonical explanation instead of restating it.

## Precision rules

Scrutinize claims using words such as:
- always
- never
- only
- single
- must
- cannot
- guaranteed

Do not promote similarity into a shared contract unless code establishes one.

Distinguish:
- architectural invariant
- current implementation detail
- historical context
- inferred design intent

If uncertain, weaken the wording or flag it for human review.

## Procedure

1. Read the root agent documentation.
2. Map the agent-document hierarchy.
3. Review documentation as one system.
4. Identify duplication, misplaced knowledge, stale claims, and overclaimed invariants.
5. Edit documentation only.
6. Explore production code only when needed to resolve a contradiction or verify a strong claim.
7. Do not discover or document unrelated architecture during this pass.

## Completion

Report only:
1. files changed
2. approximate lines removed/added
3. unresolved architectural ambiguities requiring human review