import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
import { zod4Client } from 'sveltekit-superforms/adapters';
import { createOrganizationSchema, type CreateOrganizationSchema } from '../schema.js';

export type CreateOrganizationFormInitial = SuperValidated<Infer<CreateOrganizationSchema>>;

export function createOrganizationForm(initialForm: CreateOrganizationFormInitial) {
	return superForm(initialForm, {
		validators: zod4Client(createOrganizationSchema)
	});
}
