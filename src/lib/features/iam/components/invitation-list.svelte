<script lang="ts">
	import ConfirmAction from '#lib/components/confirm-action.svelte';
	import { enhanceWithToast } from '#lib/features/feedback/enhance-with-toast.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import type { InvitationItem } from '#lib/types.ts';

	let {
		invitations,
		canResend = false,
		canCancel = false
	}: {
		invitations: InvitationItem[];
		canResend?: boolean;
		canCancel?: boolean;
	} = $props();
</script>

{#if invitations.length > 0}
	<div class="flex flex-col gap-3">
		<h2 class="text-lg font-semibold">Pending invitations</h2>
		{#each invitations as invitation (invitation.id)}
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between gap-2">
					<div class="flex flex-col gap-1">
						<Card.Title class="text-base">{invitation.email}</Card.Title>
						<Card.Description>
							Invited as {invitation.role} · {new Date(invitation.createdAt).toLocaleDateString()}
						</Card.Description>
					</div>
					<div class="flex items-center gap-2">
						<Badge variant="outline">{invitation.status}</Badge>
						{#if canResend}
							<form method="POST" action="?/resend" use:enhanceWithToast={'Invitation resent'}>
								<input type="hidden" name="email" value={invitation.email} />
								<input type="hidden" name="role" value={invitation.role.split(', ')[0]} />
								<Button type="submit" size="sm" variant="ghost">Resend</Button>
							</form>
						{/if}
						{#if canCancel}
							<ConfirmAction
								title="Cancel invitation?"
								description={`${invitation.email} will no longer be able to join with this link.`}
								confirmLabel="Cancel invite"
								action="?/cancel"
								toastMessage="Invitation cancelled"
							>
								{#snippet fields()}
									<input type="hidden" name="invitationId" value={invitation.id} />
								{/snippet}
							</ConfirmAction>
						{/if}
					</div>
				</Card.Header>
			</Card.Root>
		{/each}
	</div>
{/if}
