import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	getSession: vi.fn(),
	svelteKitHandler: vi.fn(),
	resolve: vi.fn()
}));

vi.mock('#lib/server/auth.ts', () => ({
	auth: { api: { getSession: mocks.getSession } }
}));

vi.mock('better-auth/svelte-kit', () => ({
	svelteKitHandler: mocks.svelteKitHandler
}));

vi.mock('#lib/server/db/index.ts', () => ({ db: {} }));

import { handle } from './hooks.server.js';

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
});
