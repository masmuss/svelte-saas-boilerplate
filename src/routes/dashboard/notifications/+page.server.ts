import { fail, type RequestEvent } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { hasPermission } from '#lib/permissions.ts';
import { auth } from '#lib/server/auth.ts';
import { requireUser } from '#lib/server/auth/guards.ts';
import {
	countUnread,
	getMemberRoles,
	listNotifications,
	markAllRead,
	markRead
} from '#lib/server/notifications/index.ts';
import { toNotificationItem } from '#lib/server/notifications/dto.ts';

async function scopeFor(event: RequestEvent) {
	const user = requireUser(event);
	const organizations = await auth.api.listOrganizations({ headers: event.request.headers });
	const organizationIds = organizations.map((organization) => organization.id);
	const roles = await getMemberRoles(user.id, organizationIds);

	return {
		userId: user.id,
		organizationIds,
		roles,
		isPlatformAdmin: event.locals.isPlatformAdmin ?? false
	};
}

export const load: PageServerLoad = async (event) => {
	const permissions = event.locals.permissions ?? {};
	if (!hasPermission(permissions, 'notification:read')) {
		return { allowed: false, notifications: [], unreadCount: 0 };
	}

	const scope = await scopeFor(event);
	const [notifications, unreadCount] = await Promise.all([
		listNotifications({ ...scope, limit: 50 }),
		countUnread(scope)
	]);

	return {
		allowed: true,
		notifications: notifications.map(toNotificationItem),
		unreadCount
	};
};

export const actions: Actions = {
	read: async (event) => {
		if (!hasPermission(event.locals.permissions ?? {}, 'notification:read')) {
			return fail(403, { message: 'You cannot update notifications.' });
		}

		const formData = await event.request.formData();
		const id = formData.get('id');
		if (typeof id !== 'string' || !id) return fail(400, { message: 'Missing notification id.' });

		await markRead(id, (await scopeFor(event)).userId);
		return { success: true };
	},

	readAll: async (event) => {
		if (!hasPermission(event.locals.permissions ?? {}, 'notification:read')) {
			return fail(403, { message: 'You cannot update notifications.' });
		}

		const changed = await markAllRead(await scopeFor(event));
		return { changed };
	}
};
