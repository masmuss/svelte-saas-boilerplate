import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '#lib/server/auth.ts';
import { APIError } from 'better-auth/api';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { loginFormSchema } from '#lib/features/auth/schema.ts';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/dashboard');
	}
	return {
		form: await superValidate(zod4(loginFormSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod4(loginFormSchema));

		if (!form.valid) {
			return fail(400, {
				form,
				message: 'Validation failed'
			});
		}

		try {
			await auth.api.signInEmail({
				headers: event.request.headers,
				body: {
					email: form.data.email,
					password: form.data.password
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { form, message: error.message || 'Signin failed' });
			}
			return fail(500, { form, message: 'Unexpected error' });
		}

		return redirect(302, '/dashboard');
	}
};
