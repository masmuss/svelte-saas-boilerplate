import { and, eq } from 'drizzle-orm';
import type { Handle, HandleServerError } from '@sveltejs/kit/hooks';
import { building, dev } from '$app/env';
import { auth } from '#lib/server/auth.ts';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { db } from '#lib/server/db/index.ts';
import { member } from '#lib/server/db/auth.schema.ts';
import { resolvePermissions } from '#lib/server/authz/index.ts';
import { getEntitlements, NO_ENTITLEMENTS } from '#lib/server/billing/entitlements.ts';

const PLATFORM_ROLES = ['platform_admin', 'platform_support'] as const;

const CSP = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline'",
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data: https:",
	"font-src 'self' data:",
	"connect-src 'self'",
	"frame-ancestors 'none'",
	"base-uri 'self'",
	"form-action 'self'"
].join('; ');

function withSecurityHeaders(response: Response): Response {
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

	if (!dev) {
		response.headers.set('Content-Security-Policy', CSP);
		response.headers.set(
			'Strict-Transport-Security',
			'max-age=31536000; includeSubDomains; preload'
		);
	}

	return response;
}

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	const isAppAsset =
		event.url.pathname.startsWith('/_app') ||
		event.url.pathname.startsWith('/@') ||
		/\.[a-z0-9]+$/i.test(event.url.pathname);

	if (!isAppAsset) {
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
				const [membership, entitlements] = await Promise.all([
					db
						.select({ role: member.role })
						.from(member)
						.where(
							and(eq(member.userId, session.user.id), eq(member.organizationId, organizationId))
						)
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
	}

	const response = await svelteKitHandler({ event, resolve, auth, building });
	return withSecurityHeaders(response);
};

export const handle: Handle = handleBetterAuth;

export const handleError: HandleServerError = ({ error, event, kind }) => {
	const status = kind === 'unknown' ? 500 : ((error as { status?: number }).status ?? 500);
	const message =
		kind === 'unknown' ? 'Internal error' : ((error as { message?: string }).message ?? 'Error');
	const detail = error instanceof Error ? error.message : String(error);

	console.error(
		'[server-error]',
		JSON.stringify({ status, message, kind, path: event.url.pathname, detail })
	);
};
