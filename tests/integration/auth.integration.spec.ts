import { afterEach, describe, expect, it } from 'vitest';
import { ORIGIN } from '$app/env/private';
import { auth } from '#lib/server/auth.ts';
import { db } from '#lib/server/db/index.ts';
import { user } from '#lib/server/db/auth.schema.ts';
import { eq } from 'drizzle-orm';

const password = 'Password.123!';
const testEmails: string[] = [];

function headers() {
	return new Headers({ origin: ORIGIN });
}

function createTestEmail() {
	const email = `auth-test-${crypto.randomUUID()}@example.com`;
	testEmails.push(email);
	return email;
}

describe('Better Auth email flow', () => {
	afterEach(async () => {
		for (const email of testEmails.splice(0)) {
			await db.delete(user).where(eq(user.email, email));
		}
	});

	it('rejects login before email verification', async () => {
		const email = createTestEmail();

		await auth.api.signUpEmail({
			headers: headers(),
			body: { name: 'Auth Test', email, password }
		});

		await expect(
			auth.api.signInEmail({
				headers: headers(),
				body: { email, password }
			})
		).rejects.toMatchObject({
			statusCode: 403,
			message: 'Email not verified'
		});
	});

	it('allows login after email verification', async () => {
		const email = createTestEmail();

		const signup = await auth.api.signUpEmail({
			headers: headers(),
			body: { name: 'Auth Test', email, password }
		});

		await db.update(user).set({ emailVerified: true }).where(eq(user.id, signup.user.id));

		const signin = await auth.api.signInEmail({
			headers: headers(),
			body: { email, password }
		});

		expect(signin.user.email).toBe(email);
		expect(signin.token).toEqual(expect.any(String));
	});

	it('rejects an incorrect password without exposing account details', async () => {
		const email = createTestEmail();

		const signup = await auth.api.signUpEmail({
			headers: headers(),
			body: { name: 'Auth Test', email, password }
		});

		await db.update(user).set({ emailVerified: true }).where(eq(user.id, signup.user.id));

		await expect(
			auth.api.signInEmail({
				headers: headers(),
				body: { email, password: 'Wrong.Password.123!' }
			})
		).rejects.toMatchObject({
			statusCode: 401
		});
	});
});
