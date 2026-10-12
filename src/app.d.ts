import type { User, Session } from 'better-auth';
import type { PermissionSet } from '#lib/server/authz/index.ts';
import type { Entitlements } from '#lib/server/billing/entitlements.ts';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user?: User & { platformRole?: string | null };
			session?: Session & { activeOrganizationId?: string | null };
			/** Active tenant, or null when the session has no active organization. */
			organizationId?: string | null;
			/** Role the session user holds in `organizationId`. */
			role?: string | null;
			/** Resolved once per request; read from here rather than re-querying. */
			permissions?: PermissionSet;
			isPlatformAdmin?: boolean;
			entitlements?: Entitlements;
		}

		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
