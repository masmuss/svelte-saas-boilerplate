import { and, eq, sql } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { usageRecord } from '#lib/server/db/billing.schema.ts';

export interface ConsumeQuotaInput {
	organizationId: string;
	metric: string;
	quantity: number;
	periodStart: Date;
	periodEnd: Date;
	limit: number | null;
}

export interface QuotaConsumption {
	allowed: boolean;
	used: number;
	remaining: number | null;
}

/**
 * Atomically records usage and rejects writes that would exceed the supplied limit.
 * All metered writes for the same organization, metric, and period must use this
 * function so the advisory lock is effective.
 */
export async function consumeQuota(input: ConsumeQuotaInput): Promise<QuotaConsumption> {
	if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
		throw new RangeError('Quota quantity must be a positive integer');
	}
	if (input.limit !== null && (!Number.isInteger(input.limit) || input.limit < 0)) {
		throw new RangeError('Quota limit must be a non-negative integer');
	}
	if (input.periodEnd <= input.periodStart) {
		throw new RangeError('Quota period end must be after period start');
	}

	return db.transaction(async (tx) => {
		const lockKey = JSON.stringify([
			input.organizationId,
			input.metric,
			input.periodStart.toISOString()
		]);
		await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${lockKey}))`);

		const [current] = await tx
			.select({ id: usageRecord.id, quantity: usageRecord.quantity })
			.from(usageRecord)
			.where(
				and(
					eq(usageRecord.organizationId, input.organizationId),
					eq(usageRecord.metric, input.metric),
					eq(usageRecord.periodStart, input.periodStart)
				)
			)
			.limit(1);
		const used = current?.quantity ?? 0;
		const nextUsed = used + input.quantity;

		if (input.limit !== null && nextUsed > input.limit) {
			return {
				allowed: false,
				used,
				remaining: Math.max(0, input.limit - used)
			};
		}

		if (current) {
			await tx
				.update(usageRecord)
				.set({ quantity: nextUsed, periodEnd: input.periodEnd, updatedAt: new Date() })
				.where(eq(usageRecord.id, current.id));
		} else {
			await tx.insert(usageRecord).values({
				id: crypto.randomUUID(),
				organizationId: input.organizationId,
				metric: input.metric,
				quantity: input.quantity,
				periodStart: input.periodStart,
				periodEnd: input.periodEnd
			});
		}

		return {
			allowed: true,
			used: nextUsed,
			remaining: input.limit === null ? null : Math.max(0, input.limit - nextUsed)
		};
	});
}
