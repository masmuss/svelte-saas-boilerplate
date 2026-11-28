import { and, eq, inArray, ne } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import {
	ACTIVE_SUBSCRIPTION_STATUSES,
	billingEvent,
	plan,
	subscription,
	subscriptionStatus
} from '#lib/server/db/billing.schema.ts';

type SubscriptionStatus = (typeof subscriptionStatus.enumValues)[number];

export interface BillingSubscriptionSnapshot {
	providerSubscriptionId: string;
	providerCustomerId?: string | null;
	planKey: string;
	status: SubscriptionStatus;
	seats?: number;
	currentPeriodStart?: Date | null;
	currentPeriodEnd?: Date | null;
	cancelAtPeriodEnd?: boolean;
	canceledAt?: Date | null;
	endedAt?: Date | null;
	trialEndsAt?: Date | null;
	metadata?: Record<string, unknown>;
}

export interface SyncSubscriptionEvent {
	provider: string;
	eventId: string;
	eventType: string;
	organizationId: string;
	subscription: BillingSubscriptionSnapshot;
}

export interface SyncSubscriptionResult {
	duplicate: boolean;
	subscriptionId: string | null;
}

/**
 * Applies a verified provider snapshot and records its event atomically.
 * Provider adapters must verify webhook signatures and discard stale or
 * out-of-order snapshots before calling this function.
 */
export async function syncSubscriptionFromEvent(
	input: SyncSubscriptionEvent
): Promise<SyncSubscriptionResult> {
	return db.transaction(async (tx) => {
		const [event] = await tx
			.insert(billingEvent)
			.values({
				id: crypto.randomUUID(),
				provider: input.provider,
				eventId: input.eventId,
				eventType: input.eventType,
				organizationId: input.organizationId,
				payload: { subscription: input.subscription }
			})
			.onConflictDoNothing({ target: [billingEvent.provider, billingEvent.eventId] })
			.returning({ id: billingEvent.id });

		if (!event) return { duplicate: true, subscriptionId: null };

		const [planRow] = await tx
			.select({ id: plan.id })
			.from(plan)
			.where(eq(plan.key, input.subscription.planKey))
			.limit(1);
		if (!planRow) throw new Error(`Unknown billing plan: ${input.subscription.planKey}`);

		const [existing] = await tx
			.select({ id: subscription.id, organizationId: subscription.organizationId })
			.from(subscription)
			.where(eq(subscription.providerSubscriptionId, input.subscription.providerSubscriptionId))
			.limit(1);
		if (existing && existing.organizationId !== input.organizationId) {
			throw new Error('Provider subscription already belongs to another organization');
		}

		const subscriptionId = existing?.id ?? crypto.randomUUID();
		const now = new Date();
		if (ACTIVE_SUBSCRIPTION_STATUSES.includes(input.subscription.status)) {
			await tx
				.update(subscription)
				.set({ status: 'canceled', canceledAt: now, endedAt: now, updatedAt: now })
				.where(
					and(
						eq(subscription.organizationId, input.organizationId),
						inArray(subscription.status, ACTIVE_SUBSCRIPTION_STATUSES),
						ne(subscription.id, subscriptionId)
					)
				);
		}

		const values = {
			id: subscriptionId,
			organizationId: input.organizationId,
			planId: planRow.id,
			status: input.subscription.status,
			provider: input.provider,
			providerCustomerId: input.subscription.providerCustomerId ?? null,
			providerSubscriptionId: input.subscription.providerSubscriptionId,
			seats: input.subscription.seats ?? 1,
			currentPeriodStart: input.subscription.currentPeriodStart ?? null,
			currentPeriodEnd: input.subscription.currentPeriodEnd ?? null,
			cancelAtPeriodEnd: input.subscription.cancelAtPeriodEnd ?? false,
			canceledAt:
				input.subscription.canceledAt ?? (input.subscription.status === 'canceled' ? now : null),
			endedAt: input.subscription.endedAt ?? null,
			trialEndsAt: input.subscription.trialEndsAt ?? null,
			metadata: input.subscription.metadata ?? {}
		};

		await tx
			.insert(subscription)
			.values(values)
			.onConflictDoUpdate({
				target: subscription.providerSubscriptionId,
				set: {
					planId: values.planId,
					status: values.status,
					provider: values.provider,
					providerCustomerId: values.providerCustomerId,
					seats: values.seats,
					currentPeriodStart: values.currentPeriodStart,
					currentPeriodEnd: values.currentPeriodEnd,
					cancelAtPeriodEnd: values.cancelAtPeriodEnd,
					canceledAt: values.canceledAt,
					endedAt: values.endedAt,
					trialEndsAt: values.trialEndsAt,
					metadata: values.metadata,
					updatedAt: now
				}
			});

		return { duplicate: false, subscriptionId };
	});
}
