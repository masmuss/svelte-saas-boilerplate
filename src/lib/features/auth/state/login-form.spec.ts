import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	superForm: vi.fn((initial: unknown) => ({ form: initial })),
	zod4Client: vi.fn(() => ({ validate: () => undefined }))
}));

vi.mock('sveltekit-superforms', () => ({ superForm: mocks.superForm }));
vi.mock('sveltekit-superforms/adapters', () => ({ zod4Client: mocks.zod4Client }));

import { createLoginForm } from './login-form.svelte.js';

describe('createLoginForm', () => {
	beforeEach(() => vi.clearAllMocks());

	it('seeds superForm with the initial form and schema validators', () => {
		const initial = {} as Parameters<typeof createLoginForm>[0];

		const form = createLoginForm(initial);

		expect(mocks.superForm).toHaveBeenCalledOnce();
		expect(mocks.zod4Client).toHaveBeenCalledOnce();
		expect(form).toEqual({ form: initial });
	});
});
