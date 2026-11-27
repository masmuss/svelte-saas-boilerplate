# Svelte SaaS Boilerplate

SvelteKit 2 / Svelte 5 starter with authentication, organizations, RBAC, billing entitlements and notifications.

## Stack

- bun as the package manager (`bun.lock` is the only lockfile)
- SvelteKit 2, Svelte 5 runes
- shadcn-svelte (vega style, phosphor icons) + Tailwind CSS 4
- Better Auth with Drizzle ORM and PostgreSQL
- Vitest (unit, component and integration projects)

## Setup

```bash
bun install
cp .env.example .env
bun run db:start
bun run db:migrate
bun run db:seed
bun run dev
```

Set `DATABASE_URL`, `ORIGIN` and `BETTER_AUTH_SECRET` in `.env`. Email defaults to the `console` provider; set `EMAIL_PROVIDER=resend` and `RESEND_API_KEY` to send real mail.

## Scripts

| Command              | Purpose                            |
| -------------------- | ---------------------------------- |
| `bun run dev`        | Start the dev server               |
| `bun run build`      | Production build                   |
| `bun run preview`    | Preview the production build       |
| `bun run check`      | `svelte-kit sync` + `svelte-check` |
| `bun run lint`       | Prettier check + ESLint            |
| `bun run format`     | Prettier write                     |
| `bun run test`       | Run all Vitest projects            |
| `bun run test:e2e`   | Run Playwright smoke tests         |
| `bun run db:migrate` | Apply generated Drizzle migrations |
| `bun run db:seed`    | Seed a local demo workspace        |

## Architecture

Thin SvelteKit controllers in `src/routes`, feature views in `src/lib/features`, shared UI in `src/lib/components`, and server-only capabilities in `src/lib/server`.

- `src/lib/server/auth` — session helpers and auth error mapping
- `src/lib/server/authz` — roles, permission vocabulary and resolution
- `src/lib/server/billing` — plan entitlements and limits
- `src/lib/server/email` — provider port with console and Resend adapters
- `src/lib/server/notifications` — audience-targeted notifications
- `src/lib/server/db` — Drizzle schemas and client

Request-scoped `locals` are populated once in `src/hooks.server.ts`. See `docs/architecture.md` for the full layer map and dependency rules.

## Billing scope

The billing module is a provider-agnostic entitlement foundation. It stores plans, subscriptions, limits, features, and usage records, but it does not process payments.

It does not include checkout, a customer portal, signed webhook handling, event idempotency, upgrade/downgrade/cancel flows, provider synchronization, or atomic quota enforcement. Add those before using it as a production payment integration.

## Testing

```bash
bun run check
bun run lint
bun run test
bun run test:e2e
```

Database-backed integration tests live in `tests/integration` and expect the Postgres container from `compose.yaml` to be running.

## Deployment

The build uses `@sveltejs/adapter-node` and produces a self-hosted server in `build/`.

Required environment variables: `DATABASE_URL`, `ORIGIN` and `BETTER_AUTH_SECRET`. For real email delivery, also set `EMAIL_PROVIDER=resend` and `RESEND_API_KEY`.

```bash
bun run db:migrate
HOST=0.0.0.0 PORT=3000 node build
```

CI runs migrations, `check`, `lint`, tests and the production build on pushes to `dev`/`main` and on pull requests.

## Docs

- `docs/architecture.md` — layer map and dependency rules
- `docs/adr/0001-feature-based-mvvm.md` — architecture decision
- `docs/ui-ux-audit.md` — accessibility audit, benchmarks and backlog
- `docs/runbook.md` — setup, deployment, security and operations notes
