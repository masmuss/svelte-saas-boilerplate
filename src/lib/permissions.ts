import type { PermissionSet } from './types.js';

export type { PermissionSet } from './types.js';

export type Permission = `${string}:${string}`;

export function hasPermission(permissions: PermissionSet, permission: Permission): boolean {
	const [resource, action] = permission.split(':');
	if (!resource || !action) return false;
	return permissions[resource]?.includes(action) ?? false;
}
