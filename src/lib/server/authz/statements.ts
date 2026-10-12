import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements, defaultAc } from 'better-auth/plugins/organization/access';

/**
 * Permission vocabulary for this boilerplate. Keys are resources, values are the
 * actions allowed on that resource.
 *
 * Roles declared here are the *baseline*. With `dynamicAccessControl` enabled,
 * `organizationRole` rows in the database layer extra permissions on top per
 * tenant, so a tenant can widen access without a code deploy.
 */
export const statements = {
	...defaultStatements,
	project: ['create', 'read', 'update', 'delete'],
	billing: ['read', 'manage'],
	notification: ['read', 'create'],
	platform: ['read']
} as const;

export const accessControl = createAccessControl(statements);

/** Role assigned to whoever creates the organization. */
export const owner = accessControl.newRole({
	...defaultAc.statements,
	project: ['create', 'read', 'update', 'delete'],
	billing: ['read', 'manage'],
	notification: ['read', 'create'],
	platform: ['read']
});

export const admin = accessControl.newRole({
	...defaultAc.statements,
	project: ['create', 'read', 'update', 'delete'],
	billing: ['read'],
	notification: ['read', 'create']
});

export const member = accessControl.newRole({
	project: ['read'],
	notification: ['read']
});

/** Read-only access to platform-wide concerns. */
export const support = accessControl.newRole({
	notification: ['read'],
	platform: ['read']
});

/** Baseline roles handed to the organization plugin as `roles`. */
export const roles = { owner, admin, member, support };
