import { describe, expect, it } from 'vitest';
import { buildNavigation } from './model.js';

describe('buildNavigation', () => {
	it('uses the active plan key for organization labels', () => {
		const navigation = buildNavigation([{ id: 'org_1', name: 'Acme' }], {
			planKey: 'pro',
			isActive: true,
			features: {}
		});

		expect(navigation.main).toHaveLength(1);
		expect(navigation.main[0].url).toBe('/dashboard');
		expect(navigation.organizations[0]).toMatchObject({
			id: 'org_1',
			name: 'Acme',
			plan: 'pro'
		});
	});

	it('falls back to a free plan without an active subscription', () => {
		const navigation = buildNavigation([{ id: 'org_1', name: 'Acme' }], {
			planKey: null,
			isActive: false,
			features: {}
		});

		expect(navigation.organizations[0].plan).toBe('Free');
	});
});
