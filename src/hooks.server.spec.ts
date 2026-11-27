import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	getSession: vi.fn(),
	svelteKitHandler: vi.fn(),
	resolve: vi.fn(),
	select: vi.fn(),
	from: vi.fn(),
	where: vi.fn(),
	limit: vi.fn(),
	resolvePermissions: vi.fn(),
	getEntitlements: vi.fn(),
	noEntitlements: {
		planId: null,
		planKey: null,
		status: null,
		isActive: false,
		seats: 1,
		limits: {},
		features: {}
	}
}));

vi.mock('#lib/server/auth.ts', () => ({
	auth: { api: { getSession: mocks.getSession } }
}));

vi.mock('better-auth/svelte-kit', () => ({
	svelteKitHandler: mocks.svelteKitHandler
}));

vi.mock('#lib/server/db/index.ts', () => ({ db: { select: mocks.select } }));

vi.mock('#lib/server/authz/index.ts', () => ({
	resolvePermissions: mocks.resolvePermissions
}));

vi.mock('#lib/server/billing/entitlements.ts', () => ({
	getEntitlements: mocks.getEntitlements,
	NO_ENTITLEMENTS: mocks.noEntitlements
}));

import { handle, handleError } from './hooks.server.js';

function makeEvent(pathname: string) {
	return {
		request: {
			headers: new Headers({ accept: 'text/html' }),
			url: `http://localhost${pathname}`
		},
		url: new URL(`http://localhost${pathname}`),
		locals: {}
	} as unknown as Parameters<typeof handle>[0]['event'];
}

describe('handleBetterAuth', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getSession.mockResolvedValue(null);
		mocks.svelteKitHandler.mockImplementation(
			async ({ resolve }: { resolve: typeof mocks.resolve }) => resolve()
		);
		mocks.resolve.mockResolvedValue(new Response('ok'));
		mocks.select.mockReturnValue({ from: mocks.from });
		mocks.from.mockReturnValue({ where: mocks.where });
		mocks.where.mockReturnValue({ limit: mocks.limit });
		mocks.limit.mockResolvedValue([]);
		mocks.resolvePermissions.mockResolvedValue({});
		mocks.getEntitlements.mockResolvedValue(mocks.noEntitlements);
	});

	it('skips session lookup for static assets', async () => {
		await handle({ event: makeEvent('/_app/entry.js'), resolve: mocks.resolve });

		expect(mocks.getSession).not.toHaveBeenCalled();
		expect(mocks.resolve).toHaveBeenCalledOnce();
	});

	it('resolves session context for page requests', async () => {
		await handle({ event: makeEvent('/dashboard'), resolve: mocks.resolve });

		expect(mocks.getSession).toHaveBeenCalledOnce();
		expect(mocks.resolve).toHaveBeenCalledOnce();
	});

	it('clears stale organization context when membership no longer exists', async () => {
		const event = makeEvent('/dashboard/billing');
		mocks.getSession.mockResolvedValue({
			session: { activeOrganizationId: 'stale-org' },
			user: { id: 'user-1', platformRole: null }
		});

		await handle({ event, resolve: mocks.resolve });

		expect(mocks.getEntitlements).not.toHaveBeenCalled();
		expect(event.locals.organizationId).toBeNull();
		expect(event.locals.entitlements).toEqual(mocks.noEntitlements);
	});
});

describe('handleError', () => {
	it('logs a structured error without throwing', () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

		expect(() =>
			handleError({
				error: new Error('boom'),
				event: makeEvent('/dashboard'),
				kind: 'unknown'
			} as never)
		).not.toThrow();
		expect(spy).toHaveBeenCalledWith('[server-error]', expect.any(String));

		spy.mockRestore();
	});
});
