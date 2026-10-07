# AGENTS.md

This file defines the default working rules for Codex in this repository.
The root file applies to the whole repository unless a more specific nested
`AGENTS.md` overrides it.

## Source of truth

When a task references a GitHub Issue or Pull Request, read it first and treat
it as the primary task specification.

For an issue, inspect at minimum:

```bash
gh issue view <number>
```

For review/follow-up work, also inspect the current PR, review comments, and
latest branch state before editing.

Do not invent missing business content, URLs, dates, prices, assets, or
requirements. If the issue explicitly depends on source material or assets
that are not present, implement only the supported foundation and report the
blocker clearly.

## Git workflow

Default workflow:

1. Start from the latest `develop`.
2. Create a focused feature/fix/chore branch.
3. Make only changes required by the issue.
4. Open a PR back to `develop`.
5. Reference the issue in the PR body.
6. Stop for review.

Do not:
- commit directly to `main`
- merge your own PR
- change the PR base to `main` unless explicitly requested
- mix unrelated cleanup into a feature PR

Use `Closes #N` only when the issue is actually complete.
Use `Part of #N` when a required part remains blocked or intentionally deferred.

## Scope discipline

Prefer the smallest change that satisfies the issue.

Do not expand scope into:
- Cloudflare/DNS/routing work unless the issue asks for it
- WordPress/WooCommerce changes unless the issue asks for it
- backend/database/Queue/GAS work unless the issue asks for it
- dependency upgrades, lint-infrastructure fixes, or security-audit cleanup
  unless explicitly requested
- unrelated refactors
- redesign of accepted UI/architecture

If a discovered problem is real but out of scope, document it and recommend a
separate issue instead of silently fixing it.

## Accepted architecture

Preserve these established decisions unless the issue explicitly changes them:

- Next.js App Router is the public Web Platform frontend.
- WordPress remains the CMS / WooCommerce origin during the hybrid migration.
- Public URLs stay on `lilaiireland.com`; do not expose the CMS origin to users.
- Shared Top Strip, Header, Footer, Navigation and Root Layout are site-wide shell.
- Top Strip remains sticky at the top; Header remains sticky directly below it.
- Shared navigation mirrors the current public site information architecture.
- New pages should reuse the shared shell instead of duplicating Header/Footer.
- Use the shared Design System before creating page-specific brand primitives.
- Static-first is preferred for content/marketing/event pages.
- Existing SEO URLs and permalink behavior must be preserved.

## Design system

Canonical shared styles live under:

- `src/styles/tokens.css`
- `src/styles/primitives.css`
- `src/components/ui/`
- `docs/design-system.md`

For new UI:
- use canonical color/typography/spacing/radius/shadow tokens
- reuse `ds-*` primitives and shared UI components where appropriate
- keep page-specific CSS scoped to layout/composition that is truly page-specific
- do not create another global palette or font system
- do not introduce a new UI framework without explicit approval

Legacy homepage aliases may remain for compatibility; new code should use
canonical tokens.

## Content and data

Keep reusable metadata/content in one source of truth instead of duplicating it
across page rendering, metadata, indexes, CTA components, and tests.

Do not fabricate production content. When the repository does not contain the
required source/assets, say exactly what is missing.

## Dependencies

Do not run:

```bash
npm audit fix
npm audit fix --force
```

unless explicitly requested in a dependency-maintenance task.

Do not add a package when the task can be completed with the existing stack.

Current stack is intentionally lightweight:
- Next.js
- React
- TypeScript
- plain CSS / CSS Modules

Do not add Tailwind, shadcn, Material UI, Chakra, styled-components, or another
UI framework unless an issue explicitly requires it.

## Testing

Run the tests relevant to the change and report exact results.

Default regression checks for frontend work:

```bash
npm ci
npx tsc --noEmit --incremental false
npx tsx scripts/check-shared-layout.ts
npx tsx scripts/check-design-system.ts
npm run build
git diff --check
```

If a listed script does not exist on the branch, note that and continue with the
applicable checks.

`npm run lint` is currently known to be invalid because the repository still
uses the removed `next lint` command under Next.js 16. Do not fix lint
infrastructure inside an unrelated issue. Report it as an existing limitation.

Tests must not submit production forms, write databases, send emails, or mutate
production services.

## Manual QA

When UI changes are involved, the PR body must list the browser checks still
required, including relevant desktop/mobile widths, overflow, focus-visible,
console/hydration errors, and any interaction changed by the PR.

Do not claim browser verification that was not actually performed.

## SEO and routing safety

Before changing public routes, redirects, rewrites, metadata, sitemap, robots,
or canonical behavior, inspect the existing implementation and the issue scope.

Preserve:
- existing public URLs
- canonical URLs on `https://lilaiireland.com`
- intended index/noindex behavior
- WordPress/WooCommerce route ownership
- status-code behavior where relevant

Do not solve one route by breaking another route family.

## PR quality

Before opening the PR:
- review the full diff
- confirm no unrelated files changed
- confirm protected architecture/routing files were not modified accidentally
- document intentional behavior changes and known limitations

PR body should normally include:
- Summary
- Architecture / implementation decisions
- Files changed
- Tests executed
- Manual QA required
- Known limitations
- Issue reference

Keep the PR focused enough that a reviewer can understand why every changed file
belongs to the task.

## Final Codex report

After opening the PR, report only the useful handoff details:

1. branch
2. commit SHA
3. PR URL
4. what was implemented
5. tests/results
6. remaining blockers or manual QA

Do not repeat the entire issue specification in the final report.
