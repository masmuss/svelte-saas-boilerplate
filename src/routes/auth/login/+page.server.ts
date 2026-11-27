import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '#lib/server/auth.ts';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { loginFormSchema } from '#lib/features/auth/schema.ts';
import { getAuthFailure } from '#lib/server/auth/errors.ts';
import { consumeRateLimit, rateLimitKey } from '#lib/server/security/rate-limit.ts';

function redirectTarget(event: { url: URL }): string {
	const target = event.url.searchParams.get('redirectTo');
	return target?.startsWith('/') && !target.startsWith('//') ? target : '/dashboard';
}

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, redirectTarget(event));
	}
	return {
		form: await superValidate(zod4(loginFormSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const limit = consumeRateLimit(rateLimitKey(event, 'login'), 5, 60_000);
		if (!limit.allowed) {
			return fail(429, { message: `Too many attempts. Try again in ${limit.retryAfter}s.` });
		}

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
			const failure = getAuthFailure(error, 'Signin failed');
			return fail(failure.status, { form, message: failure.message });
		}

		return redirect(302, redirectTarget(event));
	}
};
