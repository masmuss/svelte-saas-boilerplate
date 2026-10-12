import { and, arrayOverlaps, desc, eq, inArray, or, sql } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { member } from '#lib/server/db/auth.schema.ts';
import { notification, notificationRead } from '#lib/server/db/notification.schema.ts';

export interface NotifyInput {
	/** Exactly one of these three discriminates the audience. */
	audience: 'user' | 'tenant_role' | 'platform';
	userId?: string;
	organizationId?: string;
	/** Member roles this notice targets, e.g. ["owner", "admin"]. */
	roles?: string[];
	title: string;
	body: string;
	href?: string;
	data?: Record<string, unknown>;
	createdBy?: string;
}

/**
 * Creates one notification row. Read state is per-recipient and stored
 * separately, so a tenant-wide notice does not fan out into N rows on write.
 */
export async function notify(input: NotifyInput): Promise<string> {
	const id = crypto.randomUUID();

	await db.insert(notification).values({
		id,
		audience: input.audience,
		userId: input.audience === 'user' ? (input.userId ?? null) : null,
		organizationId: input.audience === 'platform' ? null : (input.organizationId ?? null),
		roles: input.audience === 'tenant_role' ? (input.roles ?? []) : null,
		title: input.title,
		body: input.body,
		href: input.href ?? null,
		data: input.data ?? {},
		createdBy: input.createdBy ?? null
	});

	return id;
}

export interface ListNotificationsInput {
	userId: string;
	organizationIds: string[];
	/** Roles the user holds in the tenant, e.g. ["owner", "admin"]. */
	roles: string[];
	isPlatformAdmin: boolean;
	limit?: number;
	offset?: number;
	filter?: 'all' | 'unread';
}

/**
 * Lists notifications addressed to the caller. Every branch is scoped to
 * `userId` or to organizations the caller is actually a member of.
 */
export async function listNotifications(input: ListNotificationsInput) {
	const conditions = [];

	if (input.filter === 'unread') {
		conditions.push(sql`${notificationRead.userId} is null`);
	}

	const audienceConditions = [
		and(eq(notification.audience, 'user'), eq(notification.userId, input.userId)),
		and(
			eq(notification.audience, 'tenant_role'),
			inArray(notification.organizationId, input.organizationIds),
			input.roles.length > 0 ? arrayOverlaps(notification.roles, input.roles) : undefined
		)
	];

	if (input.isPlatformAdmin) {
		audienceConditions.push(eq(notification.audience, 'platform'));
	}

	const rows = await db
		.select({
			id: notification.id,
			title: notification.title,
			body: notification.body,
			href: notification.href,
			audience: notification.audience,
			organizationId: notification.organizationId,
			data: notification.data,
			createdAt: notification.createdAt,
			readAt: notificationRead.readAt
		})
		.from(notification)
		.leftJoin(
			notificationRead,
			and(
				eq(notificationRead.notificationId, notification.id),
				eq(notificationRead.userId, input.userId)
			)
		)
		.where(and(or(...audienceConditions), ...conditions))
		.orderBy(desc(notification.createdAt))
		.limit(input.limit ?? 50)
		.offset(input.offset ?? 0);

	return rows;
}

/** Unread badge count for the caller. */
export async function countUnread(
	input: Omit<ListNotificationsInput, 'limit' | 'offset' | 'filter'>
) {
	const rows = await listNotifications({ ...input, filter: 'unread', limit: 1000 });
	return rows.length;
}

/** Marks one notification read. Scoped by `userId`, so ids cannot be replayed. */
export async function markRead(notificationId: string, userId: string): Promise<void> {
	await db
		.insert(notificationRead)
		.values({ notificationId, userId })
		.onConflictDoUpdate({
			target: [notificationRead.notificationId, notificationRead.userId],
			set: { readAt: new Date() }
		});
}

/** Marks every notification currently visible to the caller as read. */
export async function markAllRead(
	input: Omit<ListNotificationsInput, 'limit' | 'offset' | 'filter'>
): Promise<number> {
	const rows = await listNotifications({ ...input, filter: 'unread', limit: 1000 });
	if (rows.length === 0) return 0;

	await db
		.insert(notificationRead)
		.values(rows.map((row) => ({ notificationId: row.id, userId: input.userId })))
		.onConflictDoNothing();

	return rows.length;
}

/** Roles the user holds across the given organizations, for audience matching. */
export async function getMemberRoles(userId: string, organizationIds: string[]): Promise<string[]> {
	if (organizationIds.length === 0) return [];

	const rows = await db
		.selectDistinct({ role: member.role })
		.from(member)
		.where(and(eq(member.userId, userId), inArray(member.organizationId, organizationIds)));

	return rows.map((row) => row.role);
}
