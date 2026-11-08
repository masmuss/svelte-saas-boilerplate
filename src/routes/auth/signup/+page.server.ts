import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '#lib/server/auth.ts';
import { APIError } from 'better-auth/api';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { signupFormSchema } from '#lib/features/auth/schema.ts';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/dashboard');
	}
	return {
		form: await superValidate(zod4(signupFormSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod4(signupFormSchema));

		if (!form.valid) {
			return fail(400, {
				form,
				message: 'Validation failed'
			});
		}

		try {
			await auth.api.signUpEmail({
				body: {
					name: form.data.fullName,
					email: form.data.email,
					password: form.data.password,
					callbackURL: '/auth/verification-success'
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, {
					form,
					message: error.message || 'Registration failed'
				});
			}
			return fail(500, { form, message: 'Unexpected error' });
		}

		return redirect(302, '/auth/verification-pending');
	}
};
