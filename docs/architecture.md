# Architecture

This app uses **feature-based MVVM with a thin SvelteKit controller**. Classic MVC/MVP does not fit SvelteKit cleanly: route files already act as controllers, and Svelte 5 runes map naturally to a ViewModel.

## Layers

| Role       | Lives in                                                                 | Responsibility                                                              |
| ---------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| Controller | `src/routes/**/+page.server.ts`, `src/hooks.server.ts`                   | Validate input, authorize, call server capabilities, redirect. No UI logic. |
| Model      | `src/lib/features/**/schema.ts`, `src/lib/server/**`, `src/lib/types.ts` | Domain types, schemas, persistence, external services.                      |
| ViewModel  | `src/lib/features/**/state/*.svelte.ts`                                  | Owns `$state`, `$derived`, async commands and error state.                  |
| View       | `src/lib/features/**/*.svelte`                                           | Renders state and forwards events to the viewmodel.                         |
| Shared UI  | `src/lib/components/ui`, `src/lib/components/theme-menu.svelte`          | Generated primitives and genuinely shared shell pieces.                     |

## Dependency rules

- `routes` may import `features` and `$lib/server`.
- `features` never import `$lib/server`. Server data arrives through `load` props or actions.
- `components/ui` never import feature code.
- `*.svelte.ts` viewmodels never import browser globals at module scope and never import `$lib/server`.
- Views call viewmodel methods; they do not query databases or call external APIs directly.
- URL state (filters, pagination, active tab) stays in the URL. Initial data stays in `load`.

## Request flow

```txt
request -> hooks.server.ts (session, role, permissions, entitlements)
        -> +page.server.ts load/action
        -> feature viewmodel (client)
        -> feature view
```

`hooks.server.ts` resolves context for every non-static request, including page data requests and form actions, then hands Better Auth endpoints to `svelteKitHandler`. Skipping context for data requests would break features that re-run `load` after a client mutation.

## Feature modules

Each feature owns its views, viewmodels and schemas, and exposes a barrel:

```txt
src/lib/features/<feature>/
  components/
  state/
  schema.ts        # when the feature owns validation
  index.ts
```

Current features: `auth`, `navigation`, `organization`, `projects`. Add `billing` and `notification` features when those UIs exist; their server capabilities already live under `src/lib/server/`.

Permission checks use the pure `hasPermission` helper in `src/lib/permissions.ts`. The server authz module re-exports it so both server code and feature view models share the same vocabulary.

## Server capabilities

- `auth` — Better Auth setup, guards, error mapping and client DTOs
- `authz` — roles, permission vocabulary and per-tenant overrides
- `billing` — entitlements and plan limits
- `email` — provider port with console and Resend adapters, outbox persistence
- `notifications` — audience-targeted notices with per-user read state
- `db` — Drizzle client and segmented schemas

## Conventions

- Svelte 5 runes only. `onclick`, callback props and snippets.
- `$derived` for computed values. `$effect` only for external sync.
- shadcn-svelte semantic tokens, `cn()`, `gap-*`, `size-*`, phosphor icons.
- Zod schemas are the single validation source for forms and actions.
- Database-backed tests live in `tests/integration` and truncate relevant tables before each test.
