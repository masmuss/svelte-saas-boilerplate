import { and, eq, inArray } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { organizationRole } from '#lib/server/db/auth.schema.ts';
import { roles } from '#lib/server/authz/statements.ts';

export type PermissionSet = Record<string, string[]>;

/** A single `<resource>:<action>` pair, e.g. `project:create`. */
export type Permission = `${string}:${string}`;

/**
 * Normalizes the code-defined baseline for `role` into a mutable
 * `Record<string, string[]>`.
 *
 * The baseline comes from the role objects in `statements.ts`, not from
 * `accessControl.statements` — that object holds every statement the system
 * knows about, not the ones a given role is allowed to use. `as const` on the
 * statements means the tuples are readonly, so they are copied here.
 */
function baselinePermissions(role: string): PermissionSet {
	const definition = roles[role as keyof typeof roles];
	if (!definition) return {};

	const result: PermissionSet = {};
	for (const [resource, actions] of Object.entries(definition.statements)) {
		result[resource] = [...actions];
	}
	return result;
}

/**
 * Resolves the effective permission set for a member role, merging the
 * code-defined baseline in `statements.ts` with any per-tenant overrides stored
 * in `organization_role`.
 *
 * `member.role` may hold a comma-separated list, so every listed role
 * contributes its baseline. This mirrors the merge Better Auth performs inside
 * its own `hasPermission` endpoint. It is duplicated here so a request can
 * resolve permissions once in `hooks.server.ts` and reuse them, instead of
 * paying a round trip per check.
 */
export async function resolvePermissions(
	role: string,
	organizationId?: string
): Promise<PermissionSet> {
	const roleKeys = role.split(',').filter(Boolean);
	const merged: PermissionSet = {};

	for (const key of roleKeys) {
		Object.assign(merged, baselinePermissions(key));
	}

	if (!organizationId) return merged;

	const overrides = await db
		.select({ permission: organizationRole.permission })
		.from(organizationRole)
		.where(
			and(
				eq(organizationRole.organizationId, organizationId),
				inArray(organizationRole.role, roleKeys)
			)
		);

	if (overrides.length === 0) return merged;

	// Rows are additive: they widen the code baseline, never remove from it.
	for (const row of overrides) {
		let parsed: PermissionSet;
		try {
			parsed = JSON.parse(row.permission) as PermissionSet;
		} catch {
			continue;
		}

		for (const [resource, actions] of Object.entries(parsed)) {
			merged[resource] = [...new Set([...(merged[resource] ?? []), ...actions])];
		}
	}

	return merged;
}

/** Tests a resolved permission set for a single permission. */
export function hasPermission(permissions: PermissionSet, permission: Permission): boolean {
	const [resource, action] = permission.split(':');
	if (!resource || !action) return false;
	return permissions[resource]?.includes(action) ?? false;
}

/** Convenience wrapper: resolves then tests in one call. */
export async function can(
	role: string,
	permission: Permission,
	organizationId?: string
): Promise<boolean> {
	const permissions = await resolvePermissions(role, organizationId);
	return hasPermission(permissions, permission);
}
