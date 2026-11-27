import type { NotificationItem } from '#lib/types.ts';
import type { listNotifications } from './index.js';

type NotificationRow = Awaited<ReturnType<typeof listNotifications>>[number];

export function toNotificationItem(row: NotificationRow): NotificationItem {
	return {
		id: row.id,
		title: row.title,
		body: row.body,
		href: row.href,
		audience: row.audience,
		organizationId: row.organizationId,
		data: row.data,
		createdAt: row.createdAt.toISOString(),
		readAt: row.readAt ? row.readAt.toISOString() : null
	};
}
