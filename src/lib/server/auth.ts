import { ORIGIN, BETTER_AUTH_SECRET } from '$app/env/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { organization } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import type { User } from 'better-auth';
import { db } from '#lib/server/db/index.ts';
import { accessControl, roles } from '#lib/server/authz/statements.ts';
import { sendEmail } from '#lib/server/email/index.ts';

export const auth = betterAuth({
	baseURL: ORIGIN,
	secret: BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendVerificationEmail: async ({ user, url }: { user: User; url: string }) => {
			await sendEmail({
				to: user.email,
				template: 'verify-email',
				payload: { name: user.name, url }
			});
		}
	},
	user: {
		additionalFields: {
			platformRole: {
				type: 'string',
				required: false,
				input: false
			}
		}
	},
	plugins: [
		organization({
			ac: accessControl,
			roles,
			dynamicAccessControl: { enabled: true },
			requireEmailVerificationOnInvitation: true,
			sendInvitationEmail: async (data) => {
				await sendEmail({
					to: data.email,
					template: 'organization-invitation',
					payload: {
						invitedBy: data.inviter.user.name,
						organizationName: data.organization.name,
						inviteLink: `${ORIGIN}/accept-invitation/${data.id}`
					}
				});
			}
		}),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});

export type Auth = typeof auth;
