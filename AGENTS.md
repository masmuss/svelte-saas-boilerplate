# AGENTS.md — Svelte SaaS Boilerplate

Instructions for agents working in this repository. Humans own judgment; agents own consistency.

## Context pointers

Read these before the matching branch of work:

- **Architecture** — Read `docs/architecture.md` before adding a feature, route, server capability, or changing layer boundaries.
- **Decision record** — Read `docs/adr/0001-feature-based-mvvm.md` before proposing a different app architecture.
- **UI system** — Read `components.json` before adding shadcn-svelte components, icons, or theme tokens.
- **Commands** — Read `package.json` for script names. This file does not duplicate them. Run every script through `bun run <script>`.
- **Hooks** — Read `lefthook.yml` before changing commit or pre-commit behavior.

Code discovery: graph first. Use codebase-memory-mcp `search_graph`, `trace_path`, `get_code_snippet`, then `check_index_coverage`; fall back to grep for literals, config and non-code files.

## Package manager

Use bun. `bun.lock` is the single lockfile and the source of truth for installs.

- Install dependencies: `bun install`
- Run scripts: `bun run <script>`, e.g. `bun run check`, `bun run lint`, `bun run test`
- One-off CLIs: `bunx --bun <cli>`, e.g. `bunx --bun shadcn-svelte@latest add <name>`
- Keep commands bun-only across docs, scripts, hooks and CI so installs stay reproducible.

## Stack and library roles

| Library                                | Use here                                                                                                            |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| SvelteKit 2                            | Routing and controllers. `+page.server.ts` `load`/actions are the controller layer.                                 |
| Svelte 5 runes                         | All component state. Runes mode is forced in `vite.config.ts`.                                                      |
| shadcn-svelte 1.x + Tailwind 4         | UI primitives. Style `vega`. Generated primitives live in `src/lib/components/ui/`.                                 |
| phosphor-svelte                        | The only icon library. `components.json` declares `iconLibrary: "phosphor"`.                                        |
| sveltekit-superforms + formsnap + zod4 | Forms. Schemas in feature `schema.ts`, client setup in `state/*.svelte.ts` factories, server validation in actions. |
| Zod                                    | Single validation source for form schemas and action input.                                                         |
| Better Auth                            | Auth server in `$lib/server/auth.ts`, client in `$lib/auth-client.ts`, request bridge in `hooks.server.ts`.         |
| Drizzle ORM + postgres                 | Database access. Server-only, under `src/lib/server/db/`.                                                           |
| Vitest                                 | Unit, component and DB integration tests.                                                                           |
| mode-watcher                           | Theme mode in `src/lib/components/theme-menu.svelte`.                                                               |

Use `#lib/*` imports for project code. Generated UI already does this. Keep phosphor icons; lucide is not part of this design system.

## Architecture rules

Target pattern: **feature-based MVVM with a thin controller**. Full map lives in `docs/architecture.md`.

Dependency direction:

```txt
routes -> features -> shared
routes -> $lib/server
```

Hard boundaries:

- `features/**` never imports `$lib/server/**`. Server data arrives through `load` props or actions.
- `components/ui/**` never imports feature code.
- `*.svelte.ts` viewmodels own `$state`, `$derived`, commands and error state. They import neither `$lib/server` nor browser globals at module scope.
- Views render state and call viewmodel methods. Database access and external calls belong in `load`, actions, or server capabilities.
- Server modules never import Svelte components.

Feature layout:

```txt
src/lib/features/<feature>/
  components/
  state/            # *.svelte.ts viewmodels
  schema.ts         # when the feature owns validation
  index.ts          # public barrel
```

Routes import features through barrels. Current features: `auth`, `billing`, `iam`, `navigation`, `notifications`, `organization`, `projects`. Server capabilities for each domain live under `src/lib/server/`.

## Writing Svelte

- Use `$props`, `$state`, `$derived`, `{#snippet}` / `{@render}`, `onclick`, and callback props.
- Use `$derived` for computed values. `$effect` only for sync with an external system.
- Force intentional initial captures with `untrack(() => ...)` when a prop seeds a long-lived object such as `superForm`.
- Keep markup about rendering. Put async commands and error state in a `.svelte.ts` viewmodel.
- Forms use `Field.FieldGroup` + `Form.Field` wrappers from `src/lib/components/ui`. Create `superForm` once in a `state/*.svelte.ts` factory; actions use `superValidate` with the same Zod schema.
- Use DTOs at the server boundary. Return only fields the view needs from `load`.
- Use `refreshAll()` after client mutations that change server-loaded data. This repo uses that SvelteKit API, not `invalidateAll`.

## Writing UI

- Prefer existing shadcn-svelte primitives. Add new ones with `bunx --bun shadcn-svelte@latest add <name>`.
- Use semantic tokens: `bg-primary`, `text-muted-foreground`, `bg-muted`. Raw color utilities are for theme definitions in `src/routes/layout.css`, not components.
- Use `cn()` for conditional classes, `gap-*` instead of `space-y-*`, and `size-*` when width and height match.
- Icons come from `phosphor-svelte`. Inside a `Button`, use `data-icon="inline-start"` or `inline-end` and no sizing class.
- Generated UI files are source owned by this repo. After `shadcn-svelte add` or `update`, read the changed files and align icons and imports with `components.json`.
- Every overlay needs its accessible title. Reuse `Empty`, `Alert`, `Skeleton`, `Badge`, `Separator` before custom markup.

## Writing TypeScript

- Strict mode. No implicit `any`. The only accepted `any` is a documented workaround in generated UI; prefer `Component` from `svelte` for icon props.
- Max three arguments per function. No flag parameters. Name booleans as states.
- Pure helpers and cross-feature types live in `src/lib/`; feature-specific logic stays in the feature.
- Permission checks use `hasPermission` from `#lib/permissions.ts`; the server authz module re-exports it.
- Comments explain why, never what. Delete commented-out code.
- Files are kebab-case. Feature folders own a barrel.

## Server work

- All DB queries live under `src/lib/server/**`. Drizzle schemas are segmented and re-exported from `src/lib/server/db/schema.ts`.
- Resolve request context once in `hooks.server.ts` and read from `event.locals`. The hook skips static assets only; page data requests and form actions need the same context as HTML pages.
- Auth errors map through `getAuthFailure`. Guards such as `requireUser` belong in `src/lib/server/auth/guards.ts`.
- Email uses the `EmailProvider` port with console and Resend adapters. Templates must HTML-escape interpolated values.
- Notifications use SQL `COUNT` and set-based updates; avoid capped row reads for counts.
- Keep Better Auth and database imports out of client bundles. Type-only imports from server modules are acceptable only in `src/app.d.ts`.

## Testing

- Name node specs `*.spec.ts`; name component specs `*.svelte.spec.ts`. Vitest projects are defined in `vite.config.ts`.
- `expect` assertions are required in every test.
- DB-backed tests live in `tests/integration/` and truncate relevant tables before each test.
- Browser component tests require a local Playwright browser binary. If unavailable, place logic tests in node specs instead of skipping verification.
- Test behavior at boundaries: viewmodel commands, route actions, authorization, and data scoping.

## Completion criteria

Before calling work done:

1. Run `bun run check`, `bun run lint`, and `bun run build`.
2. Run `bun run test` or the relevant Vitest project or test file. Start the DB first for integration tests.
3. Confirm no layer rule above was broken: no feature importing `$lib/server`, no `$lib/server` import in a component, no lucide import, no `space-y-*`.
4. Review `git diff` for accidental changes to generated UI or unrelated files.

## Git workflow

Branch from `dev`. Use Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `test:`) with a short scope when useful. One logical change per commit. Lefthook formats, lints, type-checks and validates the commit message.
