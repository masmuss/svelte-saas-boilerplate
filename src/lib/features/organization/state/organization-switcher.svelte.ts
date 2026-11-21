import { refreshAll } from '$app/navigation';
import { authClient } from '#lib/auth-client.ts';

export function createOrganizationSwitcher() {
	let error = $state<string | null>(null);
	let pending = $state(false);

	async function select(organizationId: string) {
		error = null;
		pending = true;

		try {
			const result = await authClient.organization.setActive({ organizationId });

			if (result.error) {
				error = result.error.message ?? 'Unable to switch organization.';
				return;
			}

			await refreshAll();
		} finally {
			pending = false;
		}
	}

	return {
		get error() {
			return error;
		},
		get pending() {
			return pending;
		},
		select
	};
}

export type OrganizationSwitcherController = ReturnType<typeof createOrganizationSwitcher>;
