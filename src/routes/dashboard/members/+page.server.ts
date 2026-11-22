import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { inviteMemberSchema, organizationRoles } from '#lib/features/iam/index.js';
import { hasPermission } from '#lib/permissions.ts';
import { auth } from '#lib/server/auth.ts';
import { toInvitationItem, toMemberItem } from '#lib/server/auth/members.ts';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async (event) => {
	const organizationId = event.locals.organizationId;
	const permissions = event.locals.permissions ?? {};

	if (!organizationId || !hasPermission(permissions, 'ac:read')) {
		return {
			allowed: false,
			canInvite: false,
			canManage: false,
			members: [],
			invitations: [],
			canManageInvitations: false,
			form: await superValidate(zod4(inviteMemberSchema))
		};
	}

	const [members, invitations] = await Promise.all([
		auth.api.listMembers({ headers: event.request.headers, query: { organizationId } }),
		auth.api.listInvitations({ headers: event.request.headers, query: { organizationId } })
	]);

	return {
		allowed: true,
		canInvite: hasPermission(permissions, 'invitation:create'),
		canManage:
			hasPermission(permissions, 'member:update') && hasPermission(permissions, 'member:delete'),
		members: members.members.map(toMemberItem),
		invitations: invitations.map(toInvitationItem),
		canManageInvitations: hasPermission(permissions, 'invitation:cancel'),
		form: await superValidate(zod4(inviteMemberSchema))
	};
};

export const actions: Actions = {
	invite: async (event) => {
		const organizationId = event.locals.organizationId;
		if (!organizationId || !hasPermission(event.locals.permissions ?? {}, 'invitation:create')) {
			return fail(403, { message: 'You cannot invite members to this organization.' });
		}

		const form = await superValidate(event, zod4(inviteMemberSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await auth.api.createInvitation({
				headers: event.request.headers,
				body: { ...form.data, organizationId }
			});
			form.message = 'Invitation sent.';
			return { form };
		} catch {
			form.message = 'Could not send invitation.';
			return fail(500, { form });
		}
	},

	role: async (event) => {
		const organizationId = event.locals.organizationId;
		if (!organizationId || !hasPermission(event.locals.permissions ?? {}, 'member:update')) {
			return fail(403, { message: 'You cannot change member roles.' });
		}

		const formData = await event.request.formData();
		const memberId = formData.get('memberId');
		const role = formData.get('role');

		if (typeof memberId !== 'string' || !memberId) return fail(400, { message: 'Missing member.' });
		if (typeof role !== 'string' || !organizationRoles.includes(role as never)) {
			return fail(400, { message: 'Invalid role.' });
		}

		try {
			await auth.api.updateMemberRole({
				headers: event.request.headers,
				body: { memberId, role, organizationId }
			});
			return { success: true };
		} catch {
			return fail(500, { message: 'Could not update member role.' });
		}
	},

	remove: async (event) => {
		const organizationId = event.locals.organizationId;
		if (!organizationId || !hasPermission(event.locals.permissions ?? {}, 'member:delete')) {
			return fail(403, { message: 'You cannot remove members.' });
		}

		const formData = await event.request.formData();
		const memberId = formData.get('memberId');
		if (typeof memberId !== 'string' || !memberId) return fail(400, { message: 'Missing member.' });

		try {
			await auth.api.removeMember({
				headers: event.request.headers,
				body: { memberIdOrEmail: memberId, organizationId }
			});
			return { success: true };
		} catch {
			return fail(500, { message: 'Could not remove member.' });
		}
	},

	resend: async (event) => {
		const organizationId = event.locals.organizationId;
		if (!organizationId || !hasPermission(event.locals.permissions ?? {}, 'invitation:create')) {
			return fail(403, { message: 'You cannot resend invitations.' });
		}

		const formData = await event.request.formData();
		const email = formData.get('email');
		const role = formData.get('role');
		if (
			typeof email !== 'string' ||
			typeof role !== 'string' ||
			!organizationRoles.includes(role as never)
		) {
			return fail(400, { message: 'Invalid invitation.' });
		}

		try {
			await auth.api.createInvitation({
				headers: event.request.headers,
				body: { email, role, organizationId, resend: true }
			});
			return { success: true };
		} catch {
			return fail(500, { message: 'Could not resend invitation.' });
		}
	},

	cancel: async (event) => {
		if (!hasPermission(event.locals.permissions ?? {}, 'invitation:cancel')) {
			return fail(403, { message: 'You cannot cancel invitations.' });
		}

		const formData = await event.request.formData();
		const invitationId = formData.get('invitationId');
		if (typeof invitationId !== 'string' || !invitationId) {
			return fail(400, { message: 'Missing invitation.' });
		}

		try {
			await auth.api.cancelInvitation({
				headers: event.request.headers,
				body: { invitationId }
			});
			return { success: true };
		} catch {
			return fail(500, { message: 'Could not cancel invitation.' });
		}
	}
};
