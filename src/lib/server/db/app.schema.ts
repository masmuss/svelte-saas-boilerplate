import { index, integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { organization } from './auth.schema';

/**
 * Demo table showing the tenant-scoping convention every domain table must follow:
 * an `organizationId` column that cascades on tenant deletion.
 */
export const task = pgTable(
	'task',
	{
		id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
		title: text('title').notNull(),
		priority: integer('priority').notNull().default(1),
		organizationId: text('organization_id')
			.notNull()
			.references(() => organization.id, { onDelete: 'cascade' })
	},
	(table) => [index('task_organization_id_idx').on(table.organizationId)]
);

export const project = pgTable(
	'project',
	{
		id: text('id').primaryKey(),
		organizationId: text('organization_id')
			.notNull()
			.references(() => organization.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		description: text('description'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [
		index('project_organization_id_idx').on(table.organizationId),
		uniqueIndex('project_organization_name_idx').on(table.organizationId, table.name)
	]
);
