import { createAuthClient } from 'better-auth/svelte';
import { organizationClient } from 'better-auth/client/plugins';
import { inferAdditionalFields } from 'better-auth/client/plugins';
import type { auth } from '#lib/server/auth.ts';

export const authClient = createAuthClient({
	plugins: [organizationClient(), inferAdditionalFields<typeof auth>()]
});

export type Session = typeof authClient.$Infer.Session;
