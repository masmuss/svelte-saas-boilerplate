import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '#lib/server/auth.ts';
import { requireUser } from '#lib/server/auth/guards.ts';

export const load: PageServerLoad = async (event) => {
	return {
		user: requireUser(event),
		organizations: await auth.api.listOrganizations({
			headers: event.request.headers
		}),
		activeOrganizationId: event.locals.organizationId ?? null
	};
};

export const actions: Actions = {
	signOut: async (event) => {
		await auth.api.signOut({
			headers: event.request.headers
		});
		return redirect(302, '/auth/login');
	}
};
