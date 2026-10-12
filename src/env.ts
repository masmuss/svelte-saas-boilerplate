import { defineEnvVars } from '@sveltejs/kit/env';

/** Treats an unset variable as absent instead of failing validation. */
const optional = (value: string | undefined) => value;

/** Supplies a fallback when the variable is unset. */
const fallback = (value: string) => (received: string | undefined) => received ?? value;

export const variables = defineEnvVars({
	PUBLIC_APP_NAME: {
		description: 'Product name shown in email templates and the UI.',
		public: true,
		schema: fallback('Svelte Boilerplate')
	},
	DATABASE_URL: { description: 'The database connection string.' },
	ORIGIN: {
		description: 'The app origin (base URL), e.g. `http://localhost:5173`.'
	},
	BETTER_AUTH_SECRET: {
		description:
			'Secret used to sign tokens. For production use 32 characters generated with high entropy. See [Better Auth installation](https://www.better-auth.com/docs/installation).'
	},
	EMAIL_PROVIDER: {
		description: 'Outbound email transport. Use `resend` in production; defaults to logging.',
		schema: fallback('console')
	},
	EMAIL_FROM: {
		description: 'The `From` address on outbound email, e.g. `App <noreply@example.com>`.',
		schema: fallback('App <noreply@example.com>')
	},
	RESEND_API_KEY: {
		description: 'Resend API key. Only required when `EMAIL_PROVIDER` is `resend`.',
		schema: optional
	}
});
