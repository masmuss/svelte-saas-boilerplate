import { describe, expect, it } from 'vitest';
import { buildNavigation } from './model.js';

const entitlements = { planKey: 'pro', isActive: true, features: {} };

describe('buildNavigation', () => {
	it('uses the active plan key for organization labels', () => {
		const navigation = buildNavigation(
			[{ id: 'org_1', name: 'Acme' }],
			entitlements,
			{ project: ['read'] },
			'/dashboard'
		);

		expect(navigation.main).toHaveLength(2);
		expect(navigation.main[0].url).toBe('/dashboard');
		expect(navigation.main[1].url).toBe('/dashboard/projects');
		expect(navigation.organizations[0]).toMatchObject({
			id: 'org_1',
			name: 'Acme',
			plan: 'pro'
		});
	});

	it('shows Members when the role has ac:read', () => {
		const navigation = buildNavigation(
			[{ id: 'org_1', name: 'Acme' }],
			entitlements,
			{ ac: ['read'] },
			'/dashboard/members'
		);

		expect(navigation.main.map((item) => item.url)).toContain('/dashboard/members');
	});

	it('hides product links without permission', () => {
		const navigation = buildNavigation(
			[{ id: 'org_1', name: 'Acme' }],
			entitlements,
			{},
			'/dashboard'
		);

		expect(navigation.main).toHaveLength(1);
	});

	it('falls back to a free plan without an active subscription', () => {
		const navigation = buildNavigation(
			[{ id: 'org_1', name: 'Acme' }],
			{ planKey: null, isActive: false, features: {} },
			{},
			'/dashboard'
		);

		expect(navigation.organizations[0].plan).toBe('Free');
	});
});
