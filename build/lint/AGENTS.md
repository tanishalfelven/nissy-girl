# Local ESLint rules

Project-specific ESLint rules. Each file exports one rule object, registered in
`eslint.config.js` under the `local` plugin (`local/<rule-name>`).

## Requirements

- **Every rule must ship an autofixer.** Set `meta.fixable` and pass a `fix` to
  every `context.report`. A rule that cannot fix what it reports does not belong
  here; express it with a core rule or `no-restricted-syntax` instead.
- The fix must fully resolve its report: after `eslint --fix`, the rule reports
  nothing on that code. Fixes must not change behavior (`meta.type : "layout"`
  rules touch whitespace only).
- One rule per file, named for what it enforces; the export is the camelCase
  of the rule name (`padded-assignments.js` -> `paddedAssignments`).
- Rules follow the repository code style and are linted with the rest of the
  config.

## Adding a rule

1. Write the rule here with `meta.type`, `meta.fixable`, and `meta.messages`.
2. Register it in the `local` plugin in `eslint.config.js` and enable it in the
   block for the files it applies to.
3. Run `npx eslint ./src --fix`, then `npm run lint` to confirm it converges.
4. Document the convention it enforces in the root `AGENTS.md` code style list.
