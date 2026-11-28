import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	listOrganizations: vi.fn(),
	getMemberMemberships: vi.fn(),
	markRead: vi.fn()
}));

vi.mock('#lib/server/auth.ts', () => ({
	auth: { api: { listOrganizations: mocks.listOrganizations } }
}));

vi.mock('#lib/server/notifications/index.ts', () => ({
	countUnread: vi.fn(),
	getMemberMemberships: mocks.getMemberMemberships,
	listNotifications: vi.fn(),
	markAllRead: vi.fn(),
	markRead: mocks.markRead
}));

import { actions } from './+page.server.ts';

function makeEvent() {
	return {
		request: new Request('http://localhost/dashboard/notifications', {
			method: 'POST',
			body: new URLSearchParams({ id: 'notification-1' })
		}),
		locals: {
			user: { id: 'user-1' },
			permissions: { notification: ['read'] },
			isPlatformAdmin: false
		}
	} as unknown as Parameters<NonNullable<typeof actions.read>>[0];
}

describe('notification read action', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.listOrganizations.mockResolvedValue([{ id: 'org-1' }]);
		mocks.getMemberMemberships.mockResolvedValue([{ organizationId: 'org-1', roles: ['admin'] }]);
		mocks.markRead.mockResolvedValue(false);
	});

	it('returns not found when the notification is outside the caller scope', async () => {
		const read = actions.read;
		if (!read) throw new Error('Missing read action');

		const result = await read(makeEvent());

		expect(mocks.markRead).toHaveBeenCalledWith('notification-1', {
			userId: 'user-1',
			memberships: [{ organizationId: 'org-1', roles: ['admin'] }],
			isPlatformAdmin: false
		});
		expect(result).toMatchObject({ status: 404, data: { message: 'Notification not found.' } });
	});
});
