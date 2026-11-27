import { desc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '#lib/server/db/index.ts';
import { usageRecord } from '#lib/server/db/billing.schema.ts';
import { hasPermission } from '#lib/permissions.ts';
import type { UsageRecordItem } from '#lib/types.ts';

export const load: PageServerLoad = async (event) => {
	const organizationId = event.locals.organizationId;
	if (!organizationId || !hasPermission(event.locals.permissions ?? {}, 'billing:read')) {
		return { usage: [] as UsageRecordItem[] };
	}

	const rows = await db
		.select({
			id: usageRecord.id,
			metric: usageRecord.metric,
			quantity: usageRecord.quantity,
			periodStart: usageRecord.periodStart,
			periodEnd: usageRecord.periodEnd
		})
		.from(usageRecord)
		.where(eq(usageRecord.organizationId, organizationId))
		.orderBy(desc(usageRecord.periodStart))
		.limit(20);

	return {
		usage: rows.map((row) => ({
			...row,
			periodStart: row.periodStart.toISOString(),
			periodEnd: row.periodEnd.toISOString()
		}))
	};
};
