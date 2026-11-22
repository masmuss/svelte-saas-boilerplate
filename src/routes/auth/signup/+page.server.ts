import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '#lib/server/auth.ts';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { signupFormSchema } from '#lib/features/auth/schema.ts';
import { getAuthFailure } from '#lib/server/auth/errors.ts';
import { consumeRateLimit, rateLimitKey } from '#lib/server/security/rate-limit.ts';

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
		const limit = consumeRateLimit(rateLimitKey(event, 'signup'), 3, 60_000);
		if (!limit.allowed) {
			return fail(429, { message: `Too many attempts. Try again in ${limit.retryAfter}s.` });
		}

		const form = await superValidate(event, zod4(signupFormSchema));

		if (!form.valid) {
			return fail(400, {
				form,
				message: 'Validation failed'
			});
		}

		try {
			await auth.api.signUpEmail({
				headers: event.request.headers,
				body: {
					name: form.data.fullName,
					email: form.data.email,
					password: form.data.password,
					callbackURL: '/auth/verification-success'
				}
			});
		} catch (error) {
			const failure = getAuthFailure(error, 'Registration failed');
			return fail(failure.status, { form, message: failure.message });
		}

		return redirect(302, '/auth/verification-pending');
	}
};
