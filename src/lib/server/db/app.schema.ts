import { index, integer, pgTable, text } from 'drizzle-orm/pg-core';
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
