import { beforeEach, describe, expect, it } from 'vitest';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { member, organization, organizationRole, user } from '#lib/server/db/auth.schema.ts';
import { plan, subscription } from '#lib/server/db/billing.schema.ts';
import { project } from '#lib/server/db/app.schema.ts';
import { emailMessage } from '#lib/server/db/email.schema.ts';
import { notification, notificationRead } from '#lib/server/db/notification.schema.ts';
import { can, hasPermission, resolvePermissions } from '#lib/server/authz/index.ts';
import { getEntitlements } from '#lib/server/billing/entitlements.ts';
import {
	countUnread,
	getMemberMemberships,
	listNotifications,
	markAllRead,
	markRead,
	notify
} from '#lib/server/notifications/index.ts';
import { createProject, deleteProject, listProjects } from '#lib/server/projects/index.ts';

let seq = 0;
const uniq = () => `${Date.now()}-${seq++}`;

beforeEach(async () => {
	await db.execute(
		sql`TRUNCATE TABLE ${notificationRead}, ${notification}, ${emailMessage}, ${project}, ${subscription}, ${plan}, ${organizationRole}, ${member}, ${organization}, ${user} CASCADE`
	);
});

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

	it('resolves multi-role baselines independently of role order', async () => {
		const forward = await resolvePermissions('member,admin');
		const reverse = await resolvePermissions('admin,member');

		expect(reverse).toEqual(forward);
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
			memberships: [],
			isPlatformAdmin: false
		});
		const forOther = await listNotifications({
			userId: other.id,
			memberships: [],
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
			memberships: [{ organizationId: org.id, roles: ['admin'] }],
			isPlatformAdmin: false
		});
		const plainRows = await listNotifications({
			userId: plain.id,
			memberships: [{ organizationId: org.id, roles: ['member'] }],
			isPlatformAdmin: false
		});

		expect(adminRows.filter((row) => row.id === id)).toHaveLength(1);
		expect(plainRows.filter((row) => row.id === id)).toHaveLength(0);
	});

	it('matches individual roles from a comma-separated membership', async () => {
		const org = await seedOrg();
		const memberUser = await seedUser();
		await seedMember(org.id, memberUser.id, 'member,admin');

		const memberships = await getMemberMemberships(memberUser.id, [org.id]);
		const id = await notify({
			audience: 'tenant_role',
			organizationId: org.id,
			roles: ['admin'],
			title: 'Admin notice',
			body: 'Must match the admin role within the combined membership'
		});
		const rows = await listNotifications({
			userId: memberUser.id,
			memberships,
			isPlatformAdmin: false
		});

		expect(rows.filter((row) => row.id === id)).toHaveLength(1);
	});

	it('hides platform notices from non-platform-admins', async () => {
		const regular = await seedUser();
		const admin = await seedUser();

		const id = await notify({ audience: 'platform', title: 'System', body: 'Maintenance window' });

		const asRegular = await listNotifications({
			userId: regular.id,
			memberships: [],
			isPlatformAdmin: false
		});
		const asPlatformAdmin = await listNotifications({
			userId: admin.id,
			memberships: [],
			isPlatformAdmin: true
		});

		// Scope to this notice so the assertion is independent of other rows.
		expect(asRegular.filter((row) => row.id === id)).toHaveLength(0);
		expect(asPlatformAdmin.filter((row) => row.id === id)).toHaveLength(1);
	});

	it('keeps organization roles paired when listing, counting, and marking notifications read', async () => {
		const target = await seedUser();
		const adminOrg = await seedOrg();
		const memberOrg = await seedOrg();
		await seedMember(adminOrg.id, target.id, 'admin');
		await seedMember(memberOrg.id, target.id, 'member');

		const id = await notify({
			audience: 'tenant_role',
			organizationId: memberOrg.id,
			roles: ['admin'],
			title: 'Member org admin notice',
			body: 'Must not reach an admin of another organization'
		});
		const scope = {
			userId: target.id,
			memberships: [
				{ organizationId: adminOrg.id, roles: ['admin'] },
				{ organizationId: memberOrg.id, roles: ['member'] }
			],
			isPlatformAdmin: false
		};

		const visible = await listNotifications(scope);
		const unreadCount = await countUnread(scope);
		await markAllRead(scope);
		const readRows = await db
			.select({ notificationId: notificationRead.notificationId })
			.from(notificationRead)
			.where(eq(notificationRead.userId, target.id));

		expect({
			visible: visible.some((row) => row.id === id),
			unreadCount,
			readCount: readRows.length
		}).toEqual({ visible: false, unreadCount: 0, readCount: 0 });
	});

	it('does not create read state for a notification outside the caller scope', async () => {
		const caller = await seedUser();
		const foreignOrg = await seedOrg();
		const foreignAdmin = await seedUser();
		await seedMember(foreignOrg.id, foreignAdmin.id, 'admin');

		const id = await notify({
			audience: 'tenant_role',
			organizationId: foreignOrg.id,
			roles: ['admin'],
			title: 'Foreign admin notice',
			body: 'Private to another organization'
		});

		const marked = await markRead(id, {
			userId: caller.id,
			memberships: [],
			isPlatformAdmin: false
		});
		const readRows = await db
			.select({ notificationId: notificationRead.notificationId })
			.from(notificationRead)
			.where(and(eq(notificationRead.notificationId, id), eq(notificationRead.userId, caller.id)));

		expect({ marked, readCount: readRows.length }).toEqual({ marked: false, readCount: 0 });
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
			memberships: [{ organizationId: org.id, roles: ['admin'] }],
			isPlatformAdmin: false,
			filter: 'unread'
		});
		expect(before.filter((row) => row.id === id)).toHaveLength(1);

		const { markRead } = await import('#lib/server/notifications/index.ts');
		await markRead(id, {
			userId: first.id,
			memberships: [{ organizationId: org.id, roles: ['admin'] }],
			isPlatformAdmin: false
		});

		const afterFirst = await listNotifications({
			userId: first.id,
			memberships: [{ organizationId: org.id, roles: ['admin'] }],
			isPlatformAdmin: false,
			filter: 'unread'
		});
		const secondStillUnread = await listNotifications({
			userId: second.id,
			memberships: [{ organizationId: org.id, roles: ['admin'] }],
			isPlatformAdmin: false,
			filter: 'unread'
		});

		expect(afterFirst.filter((row) => row.id === id)).toHaveLength(0);
		expect(secondStillUnread.filter((row) => row.id === id)).toHaveLength(1);
	});
});

describe('projects: tenant scoping', () => {
	it('lists only projects in the active organization', async () => {
		const org = await seedOrg();
		const other = await seedOrg();
		await createProject(org.id, { name: 'Alpha' });
		await createProject(other.id, { name: 'Beta' });

		expect((await listProjects(org.id)).map((item) => item.name)).toEqual(['Alpha']);
	});

	it('cannot delete a project from another organization', async () => {
		const org = await seedOrg();
		const other = await seedOrg();
		const project = await createProject(other.id, { name: 'Foreign' });

		expect(await deleteProject(org.id, project.id)).toBe(false);
		expect((await listProjects(other.id)).map((item) => item.id)).toEqual([project.id]);
	});
});
