import type { RequestEvent } from '@sveltejs/kit';

interface Bucket {
	count: number;
	resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function rateLimitKey(event: RequestEvent, action: string): string {
	return `${action}:${event.getClientAddress()}`;
}

export function consumeRateLimit(key: string, max: number, windowMs: number) {
	const now = Date.now();

	for (const [bucketKey, bucket] of buckets) {
		if (now >= bucket.resetAt) buckets.delete(bucketKey);
	}

	const bucket = buckets.get(key);
	if (!bucket || now >= bucket.resetAt) {
		buckets.set(key, { count: 1, resetAt: now + windowMs });
		return { allowed: true, retryAfter: 0 };
	}

	if (bucket.count >= max) {
		return { allowed: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
	}

	bucket.count += 1;
	return { allowed: true, retryAfter: 0 };
}
