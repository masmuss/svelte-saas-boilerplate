import { and, desc, eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { project } from '#lib/server/db/app.schema.ts';
import type { ProjectItem } from '#lib/types.ts';

export interface CreateProjectInput {
	name: string;
	description?: string;
}

export async function listProjects(organizationId: string): Promise<ProjectItem[]> {
	const rows = await db
		.select({
			id: project.id,
			name: project.name,
			description: project.description,
			createdAt: project.createdAt
		})
		.from(project)
		.where(eq(project.organizationId, organizationId))
		.orderBy(desc(project.createdAt));

	return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }));
}

export async function createProject(
	organizationId: string,
	input: CreateProjectInput
): Promise<ProjectItem> {
	const [row] = await db
		.insert(project)
		.values({
			id: crypto.randomUUID(),
			organizationId,
			name: input.name,
			description: input.description?.trim() || null
		})
		.returning({
			id: project.id,
			name: project.name,
			description: project.description,
			createdAt: project.createdAt
		});

	return { ...row, createdAt: row.createdAt.toISOString() };
}

export async function deleteProject(organizationId: string, projectId: string): Promise<boolean> {
	const rows = await db
		.delete(project)
		.where(and(eq(project.id, projectId), eq(project.organizationId, organizationId)))
		.returning({ id: project.id });

	return rows.length > 0;
}
