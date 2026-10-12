import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '#lib/server/db/index.ts';
import { member, organization, organizationRole, user } from '#lib/server/db/auth.schema.ts';
import { plan, subscription } from '#lib/server/db/billing.schema.ts';
import { can, hasPermission, resolvePermissions } from '#lib/server/authz/index.ts';
import { getEntitlements } from '#lib/server/billing/entitlements.ts';
import { listNotifications, notify } from '#lib/server/notifications/index.ts';

let seq = 0;
const uniq = () => `${Date.now()}-${seq++}`;

async function seedUser(email?: string) {
	const id = uniq();
	const [row] = await db
		.insert(user)
		.values({ id, name: 'Test', email: email ?? `${id}@example.com` })
		.returning();
	return row;
}

async function seedOrg() {
	const id = uniq();
	const [row] = await db
		.insert(organization)
		.values({ id, name: 'Acme', slug: uniq(), createdAt: new Date() })
		.returning();
	return row;
}

async function seedMember(orgId: string, userId: string, role: string) {
	const [row] = await db
		.insert(member)
		.values({ id: uniq(), organizationId: orgId, userId, role, createdAt: new Date() })
		.returning();
	return row;
}

describe('rbac: code baseline + db overrides', () => {
	beforeEach(async () => {
		await db.delete(organizationRole);
	});

	it('resolves the code baseline when no tenant override exists', async () => {
		const permissions = await resolvePermissions('member');

		expect(hasPermission(permissions, 'project:read')).toBe(true);
	});

	it('denies an action outside the role baseline', async () => {
		const permissions = await resolvePermissions('member');

		expect(hasPermission(permissions, 'billing:manage')).toBe(false);
	});

	it('grants an extra permission from a tenant override row', async () => {
		const org = await seedOrg();

		await db.insert(organizationRole).values({
			id: uniq(),
			organizationId: org.id,
			role: 'member',
			permission: JSON.stringify({ billing: ['manage'] }),
			createdAt: new Date()
		});

		const permissions = await resolvePermissions('member', org.id);

		expect(hasPermission(permissions, 'billing:manage')).toBe(true);
	});

	it('does not leak one tenant override into another tenant', async () => {
		const granted = await seedOrg();
		const other = await seedOrg();

		await db.insert(organizationRole).values({
			id: uniq(),
			organizationId: granted.id,
			role: 'member',
			permission: JSON.stringify({ billing: ['manage'] }),
			createdAt: new Date()
		});

		const permissions = await resolvePermissions('member', other.id);

		expect(hasPermission(permissions, 'billing:manage')).toBe(false);
	});

	it('ignores an override row written for a different role', async () => {
		const org = await seedOrg();

		await db.insert(organizationRole).values({
			id: uniq(),
			organizationId: org.id,
			role: 'owner',
			permission: JSON.stringify({ billing: ['manage'] }),
			createdAt: new Date()
		});

		const permissions = await resolvePermissions('member', org.id);

		expect(hasPermission(permissions, 'billing:manage')).toBe(false);
	});

	it('is additive: override does not remove baseline permissions', async () => {
		const org = await seedOrg();

		await db.insert(organizationRole).values({
			id: uniq(),
			organizationId: org.id,
			role: 'member',
			permission: JSON.stringify({ billing: ['manage'] }),
			createdAt: new Date()
		});

		const permissions = await resolvePermissions('member', org.id);

		expect(hasPermission(permissions, 'project:read')).toBe(true);
	});

	it('can() matches hasPermission on the resolved set', async () => {
		expect(await can('owner', 'billing:manage')).toBe(true);
		expect(await can('member', 'billing:manage')).toBe(false);
	});

	it('unions the baselines of a comma-separated multi-role membership', async () => {
		const permissions = await resolvePermissions('member,admin');

		// From member
		expect(hasPermission(permissions, 'project:read')).toBe(true);
		// From admin, which member lacks on its own
		expect(hasPermission(permissions, 'billing:read')).toBe(true);
	});
});

describe('billing entitlements', () => {
	it('returns inactive entitlements when the tenant has no subscription', async () => {
		const org = await seedOrg();

		const entitlements = await getEntitlements(org.id);

		expect(entitlements.isActive).toBe(false);
		expect(entitlements.planKey).toBeNull();
	});

	it('resolves plan limits for an active subscription', async () => {
		const org = await seedOrg();
		const [row] = await db
			.insert(plan)
			.values({
				id: uniq(),
				key: uniq(),
				name: 'Pro',
				limits: { projects: 10 },
				features: { apiAccess: true }
			})
			.returning();

		await db.insert(subscription).values({
			id: uniq(),
			organizationId: org.id,
			planId: row.id,
			status: 'active',
			seats: 5
		});

		const entitlements = await getEntitlements(org.id);

		expect(entitlements.isActive).toBe(true);
		expect(entitlements.limits.projects).toBe(10);
		expect(entitlements.features.apiAccess).toBe(true);
		expect(entitlements.seats).toBe(5);
	});

	it('ignores a canceled subscription', async () => {
		const org = await seedOrg();
		const [row] = await db
			.insert(plan)
			.values({ id: uniq(), key: uniq(), name: 'Canceled' })
			.returning();

		await db.insert(subscription).values({
			id: uniq(),
			organizationId: org.id,
			planId: row.id,
			status: 'canceled'
		});

		const entitlements = await getEntitlements(org.id);

		expect(entitlements.isActive).toBe(false);
	});
});

describe('notifications: audience targeting', () => {
	it('delivers a user-targeted notice only to that user', async () => {
		const target = await seedUser();
		const other = await seedUser();

		const id = await notify({
			audience: 'user',
			userId: target.id,
			title: 'Direct',
			body: 'For you only'
		});

		const forTarget = await listNotifications({
			userId: target.id,
			organizationIds: [],
			roles: [],
			isPlatformAdmin: false
		});
		const forOther = await listNotifications({
			userId: other.id,
			organizationIds: [],
			roles: [],
			isPlatformAdmin: false
		});

		expect(forTarget.filter((row) => row.id === id)).toHaveLength(1);
		expect(forOther.filter((row) => row.id === id)).toHaveLength(0);
	});

	it('delivers a tenant_role notice to members holding any listed role', async () => {
		const org = await seedOrg();
		const admin = await seedUser();
		const plain = await seedUser();
		await seedMember(org.id, admin.id, 'admin');
		await seedMember(org.id, plain.id, 'member');

		const id = await notify({
			audience: 'tenant_role',
			organizationId: org.id,
			roles: ['owner', 'admin'],
			title: 'Billing issue',
			body: 'Action required'
		});

		const adminRows = await listNotifications({
			userId: admin.id,
			organizationIds: [org.id],
			roles: ['admin'],
			isPlatformAdmin: false
		});
		const plainRows = await listNotifications({
			userId: plain.id,
			organizationIds: [org.id],
			roles: ['member'],
			isPlatformAdmin: false
		});

		expect(adminRows.filter((row) => row.id === id)).toHaveLength(1);
		expect(plainRows.filter((row) => row.id === id)).toHaveLength(0);
	});

	it('hides platform notices from non-platform-admins', async () => {
		const regular = await seedUser();
		const admin = await seedUser();

		const id = await notify({ audience: 'platform', title: 'System', body: 'Maintenance window' });

		const asRegular = await listNotifications({
			userId: regular.id,
			organizationIds: [],
			roles: [],
			isPlatformAdmin: false
		});
		const asPlatformAdmin = await listNotifications({
			userId: admin.id,
			organizationIds: [],
			roles: [],
			isPlatformAdmin: true
		});

		// Scope to this notice: the database is shared and not cleared between runs.
		expect(asRegular.filter((row) => row.id === id)).toHaveLength(0);
		expect(asPlatformAdmin.filter((row) => row.id === id)).toHaveLength(1);
	});

	it('tracks read state per user without affecting others', async () => {
		const org = await seedOrg();
		const first = await seedUser();
		const second = await seedUser();
		await seedMember(org.id, first.id, 'admin');
		await seedMember(org.id, second.id, 'admin');

		const id = await notify({
			audience: 'tenant_role',
			organizationId: org.id,
			roles: ['admin'],
			title: 'Shared',
			body: 'Both admins see this'
		});

		const before = await listNotifications({
			userId: first.id,
			organizationIds: [org.id],
			roles: ['admin'],
			isPlatformAdmin: false,
			filter: 'unread'
		});
		expect(before.filter((row) => row.id === id)).toHaveLength(1);

		const { markRead } = await import('#lib/server/notifications/index.ts');
		await markRead(id, first.id);

		const afterFirst = await listNotifications({
			userId: first.id,
			organizationIds: [org.id],
			roles: ['admin'],
			isPlatformAdmin: false,
			filter: 'unread'
		});
		const secondStillUnread = await listNotifications({
			userId: second.id,
			organizationIds: [org.id],
			roles: ['admin'],
			isPlatformAdmin: false,
			filter: 'unread'
		});

		expect(afterFirst.filter((row) => row.id === id)).toHaveLength(0);
		expect(secondStillUnread.filter((row) => row.id === id)).toHaveLength(1);
	});
});
