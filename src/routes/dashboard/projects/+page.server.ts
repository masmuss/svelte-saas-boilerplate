import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createProjectSchema } from '#lib/features/projects/index.js';
import { hasPermission } from '#lib/permissions.ts';
import { createProject, deleteProject, listProjects } from '#lib/server/projects/index.ts';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async (event) => {
	const organizationId = event.locals.organizationId;
	const permissions = event.locals.permissions ?? {};

	return {
		allowed: hasPermission(permissions, 'project:read'),
		canCreate: hasPermission(permissions, 'project:create'),
		canDelete: hasPermission(permissions, 'project:delete'),
		projects: organizationId ? await listProjects(organizationId) : [],
		form: await superValidate(zod4(createProjectSchema))
	};
};

export const actions: Actions = {
	create: async (event) => {
		const organizationId = event.locals.organizationId;
		if (!organizationId || !hasPermission(event.locals.permissions ?? {}, 'project:create')) {
			return fail(403, { message: 'You cannot create projects in this organization.' });
		}

		const form = await superValidate(event, zod4(createProjectSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await createProject(organizationId, form.data);
			form.message = 'Project created.';
			return { form };
		} catch {
			form.message = 'Could not create project. The name may already be in use.';
			return fail(500, { form });
		}
	},

	delete: async (event) => {
		const organizationId = event.locals.organizationId;
		if (!organizationId || !hasPermission(event.locals.permissions ?? {}, 'project:delete')) {
			return fail(403, { message: 'You cannot delete projects in this organization.' });
		}

		const formData = await event.request.formData();
		const id = formData.get('id');
		if (typeof id !== 'string' || !id) return fail(400, { message: 'Missing project id.' });

		const deleted = await deleteProject(organizationId, id);
		return deleted ? { success: true } : fail(404, { message: 'Project not found.' });
	}
};
