import { describe, expect, it } from 'vitest';
import { consumeRateLimit } from './rate-limit.js';

describe('consumeRateLimit', () => {
	it('allows requests up to the limit, then blocks', () => {
		const key = `test:${crypto.randomUUID()}`;

		expect(consumeRateLimit(key, 2, 60_000).allowed).toBe(true);
		expect(consumeRateLimit(key, 2, 60_000).allowed).toBe(true);

		const blocked = consumeRateLimit(key, 2, 60_000);
		expect(blocked.allowed).toBe(false);
		expect(blocked.retryAfter).toBeGreaterThan(0);
	});

	it('resets the bucket after the window expires', () => {
		const key = `test:${crypto.randomUUID()}`;

		expect(consumeRateLimit(key, 1, 0).allowed).toBe(true);
		expect(consumeRateLimit(key, 1, 0).allowed).toBe(true);
	});
});
