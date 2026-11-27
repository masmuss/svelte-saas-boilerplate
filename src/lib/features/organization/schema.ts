import { z } from 'zod';

export const createOrganizationSchema = z.object({
	name: z
		.string()
		.min(2, 'Name must be at least 2 characters')
		.max(80, 'Name must be at most 80 characters')
		.trim(),
	slug: z
		.string()
		.min(2, 'Slug must be at least 2 characters')
		.max(60, 'Slug must be at most 60 characters')
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and dashes')
		.trim()
});

export type CreateOrganizationSchema = typeof createOrganizationSchema;
