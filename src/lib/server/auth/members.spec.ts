import { describe, expect, it } from 'vitest';
import { toInvitationItem, toMemberItem } from './members.js';

describe('member DTOs', () => {
	it('flattens nested member user data', () => {
		const item = toMemberItem({
			id: 'member_1',
			userId: 'user_1',
			role: 'owner',
			createdAt: new Date('2026-01-01T00:00:00Z'),
			user: { name: 'Ada', email: 'ada@example.com', image: null }
		});

		expect(item).toMatchObject({
			id: 'member_1',
			name: 'Ada',
			email: 'ada@example.com',
			role: 'owner',
			joinedAt: '2026-01-01T00:00:00.000Z'
		});
	});

	it('joins multi-role invitations', () => {
		const item = toInvitationItem({
			id: 'invite_1',
			email: 'invitee@example.com',
			role: ['admin', 'member'],
			status: 'pending',
			createdAt: new Date('2026-01-01T00:00:00Z')
		});

		expect(item.role).toBe('admin, member');
	});
});
