import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '#lib/server/auth.ts';
import { requireUser } from '#lib/server/auth/guards.ts';
import { getAuthFailure } from '#lib/server/auth/errors.ts';

export const load: PageServerLoad = async (event) => {
	const user = requireUser(event);
	const id = event.params.id;

	const invitation = await auth.api
		.getInvitation({ headers: event.request.headers, query: { id } })
		.catch(() => null);

	if (!invitation) error(404, 'Invitation not found or expired');

	const details = invitation as typeof invitation & {
		organizationName?: string;
		inviterEmail?: string;
	};

	return {
		invitation: {
			id: invitation.id,
			email: invitation.email,
			role: String(invitation.role),
			status: String(invitation.status),
			organizationName: details.organizationName ?? 'an organization',
			inviterEmail: details.inviterEmail ?? ''
		},
		isRecipient: invitation.email.toLowerCase() === user.email.toLowerCase()
	};
};

export const actions: Actions = {
	accept: async (event) => {
		const formData = await event.request.formData();
		const invitationId = formData.get('invitationId');
		if (typeof invitationId !== 'string' || !invitationId) {
			return fail(400, { message: 'Missing invitation.' });
		}

		try {
			await auth.api.acceptInvitation({
				headers: event.request.headers,
				body: { invitationId }
			});

			const invitation = await auth.api
				.getInvitation({ headers: event.request.headers, query: { id: invitationId } })
				.catch(() => null);

			if (invitation?.organizationId) {
				await auth.api.setActiveOrganization({
					headers: event.request.headers,
					body: { organizationId: invitation.organizationId }
				});
			}
		} catch (cause) {
			const failure = getAuthFailure(cause, 'Could not accept invitation');
			return fail(failure.status, { message: failure.message });
		}

		return redirect(302, '/dashboard');
	},

	reject: async (event) => {
		const formData = await event.request.formData();
		const invitationId = formData.get('invitationId');
		if (typeof invitationId !== 'string' || !invitationId) {
			return fail(400, { message: 'Missing invitation.' });
		}

		try {
			await auth.api.rejectInvitation({
				headers: event.request.headers,
				body: { invitationId }
			});
		} catch (cause) {
			const failure = getAuthFailure(cause, 'Could not reject invitation');
			return fail(failure.status, { message: failure.message });
		}

		return redirect(302, '/');
	}
};
