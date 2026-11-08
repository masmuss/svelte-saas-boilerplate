import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import type { User } from 'better-auth';

export function requireUser(event: RequestEvent): User {
	if (!event.locals.user) {
		redirect(302, '/auth/login');
	}

	return event.locals.user;
}
