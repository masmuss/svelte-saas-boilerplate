<script lang="ts">
	import { Badge } from '#lib/components/ui/badge/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import type { InvitationItem } from '#lib/types.ts';

	let { invitations }: { invitations: InvitationItem[] } = $props();
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
					<Badge variant="outline">{invitation.status}</Badge>
				</Card.Header>
			</Card.Root>
		{/each}
	</div>
{/if}
