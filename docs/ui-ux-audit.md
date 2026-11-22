# UI/UX Audit — Svelte SaaS Boilerplate

Date: 2026-11-22

## Scope

Audited the public auth flow and the authenticated dashboard routes using the in-app browser, Lighthouse, DOM measurements at desktop and 390×844 mobile, and the `ui-ux-pro-max` UX guideline database.

Routes measured: `/`, `/auth/login`, `/dashboard`, `/dashboard/projects`, `/dashboard/members`, `/dashboard/billing`, `/dashboard/notifications`, `/dashboard/organization`.

## Lighthouse results

| Route                      | Before (A11y / BP / SEO) | After (A11y / BP / SEO) |
| -------------------------- | ------------------------ | ----------------------- |
| `/`                        | 1.00 / 1.00 / 1.00       | 1.00 / 1.00 / 1.00      |
| `/auth/login`              | 0.98 / 1.00 / 1.00       | 1.00 / 1.00 / 1.00      |
| `/dashboard`               | 0.99 / 1.00 / 1.00       | 1.00 / 1.00 / 1.00      |
| `/dashboard/projects`      | 0.99 / 1.00 / 1.00       | 1.00 / 1.00 / 1.00      |
| `/dashboard/members`       | 0.94 / 1.00 / 1.00       | 1.00 / 1.00 / 1.00      |
| `/dashboard/billing`       | 0.99 / 1.00 / 1.00       | 1.00 / 1.00 / 1.00      |
| `/dashboard/notifications` | 0.99 / 1.00 / 1.00       | 1.00 / 1.00 / 1.00      |
| `/dashboard/organization`  | 0.99 / 1.00 / 1.00       | 1.00 / 1.00 / 1.00      |

Best Practices and SEO stayed at 1.00 throughout. Scores were taken against the dev server; production scores should be rechecked after deployment.

## Findings fixed

1. **No main landmark on auth pages** — `AuthShell` now renders `<main id="main-content">`.
2. **Decorative SVG icons exposed to screen readers** — phosphor icons rendered `role="img"` with no text alternative. All icon usages now set `aria-hidden`, including dynamic navigation and organization logo components.
3. **Unnamed role combobox on Members** — invite form `Select.Trigger` now has `aria-label="Role"`.
4. **No skip link** — root layout now has a visible-on-focus "Skip to content" link, and each main region has `id="main-content"`.
5. **Mobile touch targets** — sidebar menu buttons use 44px height on mobile and keep the dense 32px height from `md` upward. Sidebar trigger uses 44px on mobile.

## Benchmark comparison

| Area                     | Reference pattern                                                                               | Current state                                                                  | Gap                                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| Sidebar IA               | Vercel dashboard separates Projects, Team, Billing and Settings under a clear account switcher. | Single sidebar with active org switcher and role-gated sections.               | Close. Could group sections under headings when nav grows.      |
| Density and keyboard use | Linear uses dense lists, active state and visible shortcuts.                                    | Active state exists; sidebar shortcut `Cmd/Ctrl+B` exists but is undocumented. | Add shortcut hints and a `?` help panel.                        |
| Billing                  | Stripe presents plan, usage meters and invoice history in tables.                               | Plan, seats, features and limits summary.                                      | No invoices/usage history yet.                                  |
| Auth and IAM             | Clerk gives polished recovery, invitation and member management flows.                          | Signup, verification, password reset, invite acceptance, member roles.         | No invite resend/cancel UI yet.                                 |
| Component consistency    | shadcn-svelte docs use semantic tokens and consistent field/form composition.                   | Semantic tokens, Field/Form wrappers, phosphor subpath icons.                  | Strong. Keep token-only styling.                                |
| Destructive actions      | Most admin systems confirm delete/remove actions.                                               | Project delete and member remove act immediately.                              | Add confirmation dialogs.                                       |
| Feedback                 | Vercel/Stripe use toasts for async action results.                                              | Inline form messages only.                                                     | Add toast feedback for create/delete/role/notification actions. |

References used as pattern benchmarks: [shadcn-svelte sidebar](https://shadcn-svelte.com/docs/components/sidebar), [Vercel dashboard](https://vercel.com/dashboard), [Linear](https://linear.app), [Stripe dashboard](https://dashboard.stripe.com), [Clerk](https://clerk.com).

## Remaining backlog

Implemented after the audit:

- Confirmation dialogs for project delete and member remove.
- Toast feedback for create, invite, role, delete and notification mutations.
- Navigation skeletons on Projects, Members, Notifications and Billing.
- Billing usage history from `usage_record`.
- Keyboard shortcut help and a richer Projects empty state.
- Invitation decline confirmation plus resend/cancel actions.

Priority order for what remains:

1. **P2** — Invoice history once a billing provider is integrated.
2. **P3** — Full mobile device matrix for dark mode and popover/dialog behavior.
3. **P3** — Additional empty states across settings and notifications.

## Verification

```bash
bun run check
bun run lint
bun run test
bun run test:e2e
bun run build
```

All passed after the fixes. Lighthouse was re-run on every audited route with the results above.
