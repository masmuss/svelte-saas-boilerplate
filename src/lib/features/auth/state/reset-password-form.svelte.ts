import { notifySaved } from '#lib/features/feedback/toast.js';
import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
import { zod4Client } from 'sveltekit-superforms/adapters';
import { resetPasswordSchema, type ResetPasswordSchema } from '../schema.js';

export type ResetPasswordFormInitial = SuperValidated<Infer<ResetPasswordSchema>>;

export function createResetPasswordForm(initialForm: ResetPasswordFormInitial) {
	return superForm(initialForm, {
		validators: zod4Client(resetPasswordSchema),
		onResult: ({ result }) => {
			if (result.type === 'success') notifySaved('Password reset');
		}
	});
}
