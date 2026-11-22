import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createOrganizationSchema } from '#lib/features/organization/index.js';
import { auth } from '#lib/server/auth.ts';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async (event) => {
	const organizations = await auth.api.listOrganizations({ headers: event.request.headers });
	const active = organizations.find(
		(organization) => organization.id === event.locals.organizationId
	);

	const [createForm, updateForm] = await Promise.all([
		superValidate(zod4(createOrganizationSchema)),
		superValidate(
			{ name: active?.name ?? '', slug: active?.slug ?? '' },
			zod4(createOrganizationSchema)
		)
	]);

	return {
		activeOrganization: active ? { id: active.id, name: active.name, slug: active.slug } : null,
		canUpdate: Boolean(active),
		createForm,
		updateForm
	};
};

export const actions: Actions = {
	create: async (event) => {
		const form = await superValidate(event, zod4(createOrganizationSchema));
		if (!form.valid) return fail(400, { form });

		try {
			const organization = await auth.api.createOrganization({
				headers: event.request.headers,
				body: { name: form.data.name, slug: form.data.slug }
			});

			await auth.api.setActiveOrganization({
				headers: event.request.headers,
				body: { organizationId: organization.id }
			});
		} catch {
			form.message = 'Could not create organization. The slug may already be in use.';
			return fail(500, { form });
		}

		return redirect(303, '/dashboard');
	},

	update: async (event) => {
		const organizationId = event.locals.organizationId;
		if (!organizationId) return fail(400, { message: 'No active organization.' });

		const form = await superValidate(event, zod4(createOrganizationSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await auth.api.updateOrganization({
				headers: event.request.headers,
				body: {
					organizationId,
					data: { name: form.data.name, slug: form.data.slug }
				}
			});
			form.message = 'Organization updated.';
			return { form };
		} catch {
			form.message = 'Could not update organization.';
			return fail(500, { form });
		}
	}
};
