import { and, eq, inArray } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { plan, subscription } from '#lib/server/db/billing.schema.ts';
import { ACTIVE_SUBSCRIPTION_STATUSES } from '#lib/server/db/billing.schema.ts';

export interface Entitlements {
	planId: string | null;
	planKey: string | null;
	status: string | null;
	isActive: boolean;
	seats: number;
	limits: Record<string, number>;
	features: Record<string, boolean>;
}

/** Returned for a tenant with no active subscription. */
export const NO_ENTITLEMENTS: Entitlements = {
	planId: null,
	planKey: null,
	status: null,
	isActive: false,
	seats: 1,
	limits: {},
	features: {}
};

/**
 * Single read path for feature gating. Resolve once per request in
 * `hooks.server.ts` and read from `locals` rather than re-querying per check,
 * so entitlement logic cannot drift between call sites.
 */
export async function getEntitlements(organizationId: string): Promise<Entitlements> {
	const rows = await db
		.select({
			planId: subscription.planId,
			planKey: plan.key,
			status: subscription.status,
			seats: subscription.seats,
			limits: plan.limits,
			features: plan.features
		})
		.from(subscription)
		.innerJoin(plan, eq(subscription.planId, plan.id))
		.where(
			and(
				eq(subscription.organizationId, organizationId),
				inArray(subscription.status, ACTIVE_SUBSCRIPTION_STATUSES)
			)
		)
		.limit(1);

	const row = rows[0];
	if (!row) return NO_ENTITLEMENTS;

	return {
		planId: row.planId,
		planKey: row.planKey,
		status: row.status,
		isActive: true,
		seats: row.seats,
		limits: row.limits ?? {},
		features: row.features ?? {}
	};
}

/** True when the active plan grants `feature`. */
export function hasFeature(entitlements: Entitlements, feature: string): boolean {
	return entitlements.features[feature] === true;
}

/** Remaining headroom for a metered limit; `Infinity` when the metric is unmetered. */
export function remaining(entitlements: Entitlements, metric: string, used: number): number {
	const limit = entitlements.limits[metric];
	if (limit === undefined) return Number.POSITIVE_INFINITY;
	return Math.max(0, limit - used);
}
