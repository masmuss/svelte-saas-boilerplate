import type { User } from 'better-auth';
import { describe, expect, it } from 'vitest';
import { toCurrentUser } from './dto.js';

describe('toCurrentUser', () => {
	it('returns only view-safe user fields', () => {
		const user = {
			id: 'user_1',
			name: 'Ada',
			email: 'ada@example.com',
			image: undefined
		} as unknown as User;

		expect(toCurrentUser(user)).toEqual({
			id: 'user_1',
			name: 'Ada',
			email: 'ada@example.com',
			image: null
		});
	});
});
