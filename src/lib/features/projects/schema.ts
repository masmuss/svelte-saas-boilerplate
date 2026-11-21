import { z } from 'zod';

export const createProjectSchema = z.object({
	name: z
		.string()
		.min(2, 'Name must be at least 2 characters')
		.max(80, 'Name must be at most 80 characters')
		.trim(),
	description: z.string().max(500, 'Description must be at most 500 characters').trim().default('')
});

export type CreateProjectSchema = typeof createProjectSchema;
