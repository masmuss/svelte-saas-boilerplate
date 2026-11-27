import { notifySaved } from '#lib/features/feedback/toast.js';
import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
import { zod4Client } from 'sveltekit-superforms/adapters';
import { inviteMemberSchema, type InviteMemberSchema } from '../schema.js';

export type InviteMemberFormInitial = SuperValidated<Infer<InviteMemberSchema>>;

export function createInviteMemberForm(initialForm: InviteMemberFormInitial) {
	return superForm(initialForm, {
		validators: zod4Client(inviteMemberSchema),
		onResult: ({ result }) => {
			if (result.type === 'success') notifySaved('Invitation sent');
		}
	});
}
