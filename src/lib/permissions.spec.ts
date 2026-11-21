import { describe, expect, it } from 'vitest';
import { hasPermission } from './permissions.js';

describe('hasPermission', () => {
	it('allows an action granted to a role', () => {
		expect(hasPermission({ project: ['read'] }, 'project:read')).toBe(true);
	});

	it('denies an action outside the granted set', () => {
		expect(hasPermission({ project: ['read'] }, 'project:delete')).toBe(false);
	});

	it('denies malformed permissions', () => {
		expect(hasPermission({ project: ['read'] }, 'project' as never)).toBe(false);
	});
});
