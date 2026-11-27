# ADR 0001: Feature-based MVVM with a thin controller

## Status

Accepted.

## Context

SvelteKit already provides a controller boundary through `+page.server.ts` load functions and actions. Svelte 5 runes provide reactive state without a separate state library. The repo also has server-only capability modules for auth, authz, billing, email and notifications.

Classic patterns were considered:

- **MVC** — would add explicit controller classes on top of route files, duplicating SvelteKit's routing layer.
- **MVP** — would push all logic into imperative presenters and leave views passive, fighting runes and two-way binding.
- **MVVM** — maps directly: routes are controllers, `.svelte.ts` modules are viewmodels, components are views.

## Decision

Organize client code by feature. Each feature owns its views, viewmodels and schemas, and exposes a barrel. Server-only capabilities remain in `src/lib/server` behind a no-client-import rule. Request-scoped auth context is resolved once in `hooks.server.ts` and read from `event.locals`.

## Consequences

- Features can be added without touching unrelated UI folders.
- Viewmodels are testable without mounting components.
- Server secrets and database code cannot leak into client bundles through feature imports.
- Requires discipline: feature code must never import `$lib/server`; shared UI must never import feature code.
