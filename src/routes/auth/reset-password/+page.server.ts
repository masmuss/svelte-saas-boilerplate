import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { resetPasswordSchema } from '#lib/features/auth/index.js';
import { auth } from '#lib/server/auth.ts';
import { getAuthFailure } from '#lib/server/auth/errors.ts';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async (event) => ({
	token: event.url.searchParams.get('token') ?? '',
	form: await superValidate(
		{ password: '', token: event.url.searchParams.get('token') ?? '' },
		zod4(resetPasswordSchema)
	)
});

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod4(resetPasswordSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await auth.api.resetPassword({
				headers: event.request.headers,
				query: { token: form.data.token },
				body: { newPassword: form.data.password, token: form.data.token }
			});
		} catch (error) {
			const failure = getAuthFailure(error, 'Could not reset password');
			form.message = failure.message;
			return fail(failure.status, { form });
		}

		return redirect(302, '/auth/login?reset=1');
	}
};
