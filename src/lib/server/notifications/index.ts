import { and, arrayOverlaps, count, desc, eq, inArray, or, sql } from 'drizzle-orm';
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

export interface MemberMembership {
	organizationId: string;
	roles: string[];
}

export interface ListNotificationsInput {
	userId: string;
	memberships: MemberMembership[];
	isPlatformAdmin: boolean;
	limit?: number;
	offset?: number;
	filter?: 'all' | 'unread';
}

type NotificationScope = Omit<ListNotificationsInput, 'limit' | 'offset' | 'filter'>;

function readJoin(userId: string) {
	return and(
		eq(notificationRead.notificationId, notification.id),
		eq(notificationRead.userId, userId)
	);
}

function notificationWhere(input: NotificationScope, filter: 'all' | 'unread') {
	const conditions = [];

	if (filter === 'unread') {
		conditions.push(sql`${notificationRead.userId} is null`);
	}

	const membershipConditions = input.memberships
		.filter((membership) => membership.roles.length > 0)
		.map((membership) =>
			and(
				eq(notification.audience, 'tenant_role'),
				eq(notification.organizationId, membership.organizationId),
				arrayOverlaps(notification.roles, membership.roles)
			)
		);
	const audienceConditions = [
		and(eq(notification.audience, 'user'), eq(notification.userId, input.userId)),
		...membershipConditions
	];

	if (input.isPlatformAdmin) {
		audienceConditions.push(eq(notification.audience, 'platform'));
	}

	return and(or(...audienceConditions), ...conditions);
}

/**
 * Lists notifications addressed to the caller. Every branch is scoped to
 * `userId` or to organizations the caller is actually a member of.
 */
export async function listNotifications(input: ListNotificationsInput) {
	return db
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
		.leftJoin(notificationRead, readJoin(input.userId))
		.where(notificationWhere(input, input.filter ?? 'all'))
		.orderBy(desc(notification.createdAt))
		.limit(input.limit ?? 50)
		.offset(input.offset ?? 0);
}

/** Unread badge count for the caller. Uses SQL COUNT instead of a row cap. */
export async function countUnread(input: NotificationScope): Promise<number> {
	const [row] = await db
		.select({ value: count() })
		.from(notification)
		.leftJoin(notificationRead, readJoin(input.userId))
		.where(notificationWhere(input, 'unread'));

	return row?.value ?? 0;
}

/** Marks one notification read only when it is visible to the caller. */
export async function markRead(notificationId: string, input: NotificationScope): Promise<boolean> {
	const rows = await db
		.insert(notificationRead)
		.select(
			db
				.select({
					notificationId: notification.id,
					userId: sql<string>`${input.userId}`.as('user_id'),
					readAt: sql<Date>`now()`.as('read_at')
				})
				.from(notification)
				.where(and(eq(notification.id, notificationId), notificationWhere(input, 'all')))
		)
		.onConflictDoUpdate({
			target: [notificationRead.notificationId, notificationRead.userId],
			set: { readAt: new Date() }
		})
		.returning({ notificationId: notificationRead.notificationId });

	return rows.length > 0;
}

/** Marks every notification currently visible to the caller as read. */
export async function markAllRead(input: NotificationScope): Promise<number> {
	const rows = await db
		.select({ id: notification.id })
		.from(notification)
		.leftJoin(notificationRead, readJoin(input.userId))
		.where(notificationWhere(input, 'unread'));

	if (rows.length === 0) return 0;

	await db
		.insert(notificationRead)
		.values(rows.map((row) => ({ notificationId: row.id, userId: input.userId })))
		.onConflictDoNothing();

	return rows.length;
}

/** Roles the user holds in each organization, for audience matching. */
export async function getMemberMemberships(
	userId: string,
	organizationIds: string[]
): Promise<MemberMembership[]> {
	if (organizationIds.length === 0) return [];

	const rows = await db
		.selectDistinct({ organizationId: member.organizationId, role: member.role })
		.from(member)
		.where(and(eq(member.userId, userId), inArray(member.organizationId, organizationIds)));
	const rolesByOrganization = new Map<string, Set<string>>();

	for (const row of rows) {
		const roles = rolesByOrganization.get(row.organizationId) ?? new Set<string>();
		for (const role of row.role
			.split(',')
			.map((value) => value.trim())
			.filter(Boolean)) {
			roles.add(role);
		}
		rolesByOrganization.set(row.organizationId, roles);
	}

	return [...rolesByOrganization].map(([organizationId, roles]) => ({
		organizationId,
		roles: [...roles]
	}));
}
