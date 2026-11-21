import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
import { zod4Client } from 'sveltekit-superforms/adapters';
import { signupFormSchema, type SignUpFormSchema } from '../schema.js';

export type SignupFormInitial = SuperValidated<Infer<SignUpFormSchema>>;

export function createSignupForm(initialForm: SignupFormInitial) {
	return superForm(initialForm, {
		validators: zod4Client(signupFormSchema)
	});
}
