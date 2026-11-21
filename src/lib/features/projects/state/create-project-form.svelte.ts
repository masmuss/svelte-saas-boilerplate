import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
import { zod4Client } from 'sveltekit-superforms/adapters';
import { createProjectSchema, type CreateProjectSchema } from '../schema.js';

export type CreateProjectFormInitial = SuperValidated<Infer<CreateProjectSchema>>;

export function createProjectForm(initialForm: CreateProjectFormInitial) {
	return superForm(initialForm, {
		validators: zod4Client(createProjectSchema)
	});
}
