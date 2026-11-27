import type { CurrentUser } from '#lib/types.ts';
import type { User } from 'better-auth';

export function toCurrentUser(user: User): CurrentUser {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		image: user.image ?? null
	};
}
