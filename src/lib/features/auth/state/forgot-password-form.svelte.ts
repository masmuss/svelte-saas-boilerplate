import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
import { zod4Client } from 'sveltekit-superforms/adapters';
import { forgotPasswordSchema, type ForgotPasswordSchema } from '../schema.js';

export type ForgotPasswordFormInitial = SuperValidated<Infer<ForgotPasswordSchema>>;

export function createForgotPasswordForm(initialForm: ForgotPasswordFormInitial) {
	return superForm(initialForm, {
		validators: zod4Client(forgotPasswordSchema)
	});
}
