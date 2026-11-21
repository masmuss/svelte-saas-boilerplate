import { z } from 'zod';

export const organizationRoles = ['owner', 'admin', 'member', 'support'] as const;

export const inviteMemberSchema = z.object({
	email: z.email('Invalid email address').lowercase().trim(),
	role: z.enum(organizationRoles)
});

export type InviteMemberSchema = typeof inviteMemberSchema;
export type OrganizationRole = (typeof organizationRoles)[number];
