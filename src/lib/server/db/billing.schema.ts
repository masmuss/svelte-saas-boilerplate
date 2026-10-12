import {
	boolean,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex
} from 'drizzle-orm/pg-core';
import { organization } from './auth.schema';

export const subscriptionStatus = pgEnum('subscription_status', [
	'trialing',
	'active',
	'past_due',
	'paused',
	'canceled',
	'incomplete'
]);

/** Statuses that grant access to paid features. */
export const ACTIVE_SUBSCRIPTION_STATUSES: (typeof subscriptionStatus.enumValues)[number][] = [
	'trialing',
	'active'
];

export const plan = pgTable(
	'plan',
	{
		id: text('id').primaryKey(),
		/** Machine key used in checkout calls, e.g. "pro". */
		key: text('key').notNull(),
		name: text('name').notNull(),
		description: text('description'),
		priceMonthlyCents: integer('price_monthly_cents').notNull().default(0),
		priceYearlyCents: integer('price_yearly_cents'),
		currency: text('currency').notNull().default('usd'),
		/** Marketing feature list, e.g. { apiAccess: true }. */
		features: jsonb('features').$type<Record<string, boolean>>().notNull().default({}),
		/** Hard quota limits, e.g. { projects: 10, seats: 5 }. */
		limits: jsonb('limits').$type<Record<string, number>>().notNull().default({}),
		isActive: boolean('is_active').notNull().default(true),
		sortOrder: integer('sort_order').notNull().default(0)
	},
	(table) => [uniqueIndex('plan_key_unique').on(table.key)]
);

export const subscription = pgTable(
	'subscription',
	{
		id: text('id').primaryKey(),
		organizationId: text('organization_id')
			.notNull()
			.references(() => organization.id, { onDelete: 'cascade' }),
		planId: text('plan_id')
			.notNull()
			.references(() => plan.id, { onDelete: 'restrict' }),
		status: subscriptionStatus('status').notNull().default('incomplete'),
		/**
		 * Billing provider key, e.g. "stripe". Kept generic so a provider can be
		 * swapped in without reshaping the table.
		 */
		provider: text('provider'),
		providerCustomerId: text('provider_customer_id'),
		providerSubscriptionId: text('provider_subscription_id'),
		seats: integer('seats').notNull().default(1),
		currentPeriodStart: timestamp('current_period_start', { withTimezone: true }),
		currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
		cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
		canceledAt: timestamp('canceled_at', { withTimezone: true }),
		endedAt: timestamp('ended_at', { withTimezone: true }),
		trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
		metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [
		index('subscription_organization_id_idx').on(table.organizationId),
		index('subscription_status_idx').on(table.status),
		uniqueIndex('subscription_provider_id_unique').on(table.providerSubscriptionId)
	]
);

/**
 * Per-period consumption counters, e.g. { metric: "api_calls", quantity: 4200 }.
 * Reset each period by rolling currentPeriodStart.
 */
export const usageRecord = pgTable(
	'usage_record',
	{
		id: text('id').primaryKey(),
		organizationId: text('organization_id')
			.notNull()
			.references(() => organization.id, { onDelete: 'cascade' }),
		subscriptionId: text('subscription_id').references(() => subscription.id, {
			onDelete: 'cascade'
		}),
		metric: text('metric').notNull(),
		quantity: integer('quantity').notNull().default(0),
		periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
		periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [
		uniqueIndex('usage_record_metric_period_unique').on(
			table.organizationId,
			table.metric,
			table.periodStart
		),
		index('usage_record_subscription_id_idx').on(table.subscriptionId)
	]
);
