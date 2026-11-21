import type { LayoutServerLoad } from './$types';
import { auth } from '#lib/server/auth.ts';
import { toCurrentUser } from '#lib/server/auth/dto.ts';
import { requireUser } from '#lib/server/auth/guards.ts';

export const load: LayoutServerLoad = async (event) => {
	const entitlements = event.locals.entitlements;

	return {
		user: toCurrentUser(requireUser(event)),
		organizations: await auth.api.listOrganizations({
			headers: event.request.headers
		}),
		activeOrganizationId: event.locals.organizationId ?? null,
		entitlements: {
			planKey: entitlements?.planKey ?? null,
			isActive: entitlements?.isActive ?? false,
			features: entitlements?.features ?? {}
		},
		permissions: event.locals.permissions ?? {},
		activePath: event.url.pathname
	};
};
