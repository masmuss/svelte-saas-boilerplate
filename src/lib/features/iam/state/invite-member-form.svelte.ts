import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
import { zod4Client } from 'sveltekit-superforms/adapters';
import { inviteMemberSchema, type InviteMemberSchema } from '../schema.js';

export type InviteMemberFormInitial = SuperValidated<Infer<InviteMemberSchema>>;

export function createInviteMemberForm(initialForm: InviteMemberFormInitial) {
	return superForm(initialForm, {
		validators: zod4Client(inviteMemberSchema)
	});
}
