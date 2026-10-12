import { and, eq } from 'drizzle-orm';
import type { Handle } from '@sveltejs/kit/hooks';
import { building } from '$app/env';
import { auth } from '#lib/server/auth.ts';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { db } from '#lib/server/db/index.ts';
import { member } from '#lib/server/db/auth.schema.ts';
import { resolvePermissions } from '#lib/server/authz/index.ts';
import { getEntitlements, NO_ENTITLEMENTS } from '#lib/server/billing/entitlements.ts';

const PLATFORM_ROLES = ['platform_admin', 'platform_support'] as const;

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;

		const platformRole = session.user.platformRole ?? null;
		event.locals.isPlatformAdmin =
			platformRole !== null && (PLATFORM_ROLES as readonly string[]).includes(platformRole);

		const organizationId = session.session.activeOrganizationId ?? null;
		event.locals.organizationId = organizationId;
		event.locals.role = null;
		event.locals.permissions = {};
		event.locals.entitlements = NO_ENTITLEMENTS;

		if (organizationId) {
			// Membership and entitlements are independent reads, so run them together.
			const [membership, entitlements] = await Promise.all([
				db
					.select({ role: member.role })
					.from(member)
					.where(and(eq(member.userId, session.user.id), eq(member.organizationId, organizationId)))
					.limit(1)
					.then((rows) => rows[0] ?? null),
				getEntitlements(organizationId)
			]);

			if (membership) {
				event.locals.role = membership.role;
				event.locals.permissions = await resolvePermissions(membership.role, organizationId);
			}

			event.locals.entitlements = entitlements;
		}
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = handleBetterAuth;
