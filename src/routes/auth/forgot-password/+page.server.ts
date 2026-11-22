import { fail } from '@sveltejs/kit';
import { ORIGIN } from '$app/env/private';
import type { Actions, PageServerLoad } from './$types';
import { forgotPasswordSchema } from '#lib/features/auth/index.js';
import { auth } from '#lib/server/auth.ts';
import { consumeRateLimit, rateLimitKey } from '#lib/server/security/rate-limit.ts';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async () => ({
	form: await superValidate(zod4(forgotPasswordSchema))
});

export const actions: Actions = {
	default: async (event) => {
		const limit = consumeRateLimit(rateLimitKey(event, 'forgot-password'), 3, 300_000);
		if (!limit.allowed) {
			return fail(429, { message: `Too many attempts. Try again in ${limit.retryAfter}s.` });
		}

		const form = await superValidate(event, zod4(forgotPasswordSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await auth.api.requestPasswordReset({
				headers: event.request.headers,
				body: {
					email: form.data.email,
					redirectTo: `${ORIGIN}/auth/reset-password`
				}
			});
			form.message = 'If the account exists, a reset link has been sent.';
			return { form };
		} catch {
			form.message = 'Could not send reset link. Please try again.';
			return fail(500, { form });
		}
	}
};
