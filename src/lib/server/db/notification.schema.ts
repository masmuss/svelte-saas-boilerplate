import { index, jsonb, pgEnum, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';
import { organization, user } from './auth.schema';

export const notificationAudience = pgEnum('notification_audience', [
	/** Delivered to a single user. */
	'user',
	/** Delivered to members of one organization holding any of `role`. */
	'tenant_role',
	/** Delivered to every platform admin. */
	'platform'
]);

/**
 * One row per event, not per recipient. Read state lives in `notificationRead`,
 * so a tenant-wide notice does not fan out into N duplicate rows on write.
 *
 * `organizationId` is null for platform-scoped notices.
 */
export const notification = pgTable(
	'notification',
	{
		id: text('id').primaryKey(),
		organizationId: text('organization_id').references(() => organization.id, {
			onDelete: 'cascade'
		}),
		audience: notificationAudience('audience').notNull(),
		/** Required when `audience` = 'user'. */
		userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
		/** Member roles this notice targets. Required when `audience` = 'tenant_role'. */
		roles: text('roles').array(),
		title: text('title').notNull(),
		body: text('body').notNull(),
		href: text('href'),
		data: jsonb('data').$type<Record<string, unknown>>().notNull().default({}),
		createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		index('notification_organization_id_created_at_idx').on(table.organizationId, table.createdAt),
		index('notification_audience_idx').on(table.audience)
	]
);

/**
 * Per-user read state. Keeping it separate means `markRead(id)` always has a
 * `userId` predicate to scope on, so a notification id can never be read by
 * someone it was not addressed to.
 */
export const notificationRead = pgTable(
	'notification_read',
	{
		notificationId: text('notification_id')
			.notNull()
			.references(() => notification.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		readAt: timestamp('read_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		primaryKey({ columns: [table.notificationId, table.userId] }),
		index('notification_read_user_id_idx').on(table.userId)
	]
);
