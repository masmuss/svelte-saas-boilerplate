# Runbook

## Local setup

```bash
bun install
cp .env.example .env
bun run db:start
bun run db:migrate
bun run db:seed
bun run dev
```

Seed login: `seed@example.com` / `Seed.Pass.123!`.

## Verification

```bash
bun run check
bun run lint
bun run test
bun run test:e2e
bun run build
```

Integration tests expect the Postgres container from `compose.yaml` on port `5433`.

## Database changes

- Edit schemas under `src/lib/server/db/`.
- Generate a migration with `bun run db:generate`.
- Apply with `bun run db:migrate`.
- Commit both SQL and Drizzle metadata.

## Deployment

Build uses `@sveltejs/adapter-node` and outputs a server to `build/`.

Required environment:

- `DATABASE_URL`
- `ORIGIN`
- `BETTER_AUTH_SECRET`

Optional:

- `EMAIL_PROVIDER=resend`
- `RESEND_API_KEY`
- `EMAIL_FROM`

Start with:

```bash
HOST=0.0.0.0 PORT=3000 node build
```

`GET /health` checks database connectivity and returns `{ "status": "ok" }` or HTTP 503.

## Security notes

- Auth form actions and Better Auth client endpoints are rate limited in-process. Use a shared store such as Redis only when running multiple instances.
- `bun audit` reports moderate dev-only advisories in `esbuild` and `minimatch`; transitive ranges currently block an in-range fix. Review again when upstream ranges change.
- Security headers, CSP, HSTS and structured server error logging are configured in `src/hooks.server.ts`.
