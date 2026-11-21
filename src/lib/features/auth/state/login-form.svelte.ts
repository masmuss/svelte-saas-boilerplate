import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
import { zod4Client } from 'sveltekit-superforms/adapters';
import { loginFormSchema, type LoginFormSchema } from '../schema.js';

export type LoginFormInitial = SuperValidated<Infer<LoginFormSchema>>;

export function createLoginForm(initialForm: LoginFormInitial) {
	return superForm(initialForm, {
		validators: zod4Client(loginFormSchema)
	});
}
