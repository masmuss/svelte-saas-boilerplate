import { index, integer, jsonb, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const emailStatus = pgEnum('email_status', ['queued', 'sent', 'failed']);

/**
 * Outbox for outbound email. A row is written before delivery is attempted so a
 * failed send leaves an auditable, retryable record instead of a silent gap.
 */
export const emailMessage = pgTable(
	'email_message',
	{
		id: text('id').primaryKey(),
		to: text('to').notNull(),
		subject: text('subject').notNull(),
		template: text('template').notNull(),
		payload: jsonb('payload').$type<Record<string, unknown>>().notNull().default({}),
		html: text('html').notNull(),
		text: text('text').notNull(),
		status: emailStatus('status').notNull().default('queued'),
		provider: text('provider'),
		providerId: text('provider_id'),
		error: text('error'),
		attempts: integer('attempts').notNull().default(0),
		sentAt: timestamp('sent_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		index('email_message_status_idx').on(table.status),
		index('email_message_to_idx').on(table.to)
	]
);
