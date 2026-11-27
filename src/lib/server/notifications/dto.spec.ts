import { describe, expect, it } from 'vitest';
import { toNotificationItem } from './dto.js';

describe('toNotificationItem', () => {
	it('serializes dates and preserves read state', () => {
		const item = toNotificationItem({
			id: 'notif_1',
			title: 'Hello',
			body: 'Body',
			href: null,
			audience: 'user',
			organizationId: null,
			data: {},
			createdAt: new Date('2026-01-01T00:00:00Z'),
			readAt: new Date('2026-01-02T00:00:00Z')
		});

		expect(item.createdAt).toBe('2026-01-01T00:00:00.000Z');
		expect(item.readAt).toBe('2026-01-02T00:00:00.000Z');
	});
});
