import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PermissionSet } from '#lib/permissions.ts';

const mocks = vi.hoisted(() => ({
	select: vi.fn(),
	from: vi.fn(),
	where: vi.fn(),
	orderBy: vi.fn(),
	limit: vi.fn()
}));

vi.mock('#lib/server/db/index.ts', () => ({ db: { select: mocks.select } }));

import { load } from './+page.server.ts';

function makeEvent(input: { organizationId: string | null; permissions: PermissionSet }) {
	return { locals: input } as unknown as Parameters<typeof load>[0];
}

describe('billing page load authorization', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.select.mockReturnValue({ from: mocks.from });
		mocks.from.mockReturnValue({ where: mocks.where });
		mocks.where.mockReturnValue({ orderBy: mocks.orderBy });
		mocks.orderBy.mockReturnValue({ limit: mocks.limit });
		mocks.limit.mockResolvedValue([]);
	});

	it('does not query usage without billing read permission', async () => {
		const result = await load(makeEvent({ organizationId: 'org-1', permissions: {} }));

		expect(mocks.select).not.toHaveBeenCalled();
		expect(result).toEqual({ usage: [] });
	});

	it('does not query usage without an active organization', async () => {
		const result = await load(
			makeEvent({ organizationId: null, permissions: { billing: ['read'] } })
		);

		expect(mocks.select).not.toHaveBeenCalled();
		expect(result).toEqual({ usage: [] });
	});

	it('queries usage for an authorized organization', async () => {
		await load(makeEvent({ organizationId: 'org-1', permissions: { billing: ['read'] } }));

		expect(mocks.select).toHaveBeenCalledOnce();
	});
});
