import { notifySaved } from '#lib/features/feedback/toast.js';
import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
import { zod4Client } from 'sveltekit-superforms/adapters';
import { forgotPasswordSchema, type ForgotPasswordSchema } from '../schema.js';

export type ForgotPasswordFormInitial = SuperValidated<Infer<ForgotPasswordSchema>>;

export function createForgotPasswordForm(initialForm: ForgotPasswordFormInitial) {
	return superForm(initialForm, {
		validators: zod4Client(forgotPasswordSchema),
		onResult: ({ result }) => {
			if (result.type === 'success') notifySaved('Reset link sent');
		}
	});
}
