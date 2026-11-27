<script lang="ts">
	import { resolve } from '$app/paths';
	import ConfirmAction from '#lib/components/confirm-action.svelte';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import { AuthShell } from '#lib/features/auth/index.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>Organization Invitation | Svelte Boilerplate</title>
</svelte:head>

<AuthShell>
	<Card.Root>
		<Card.Header>
			<Card.Title>Organization invitation</Card.Title>
			<Card.Description>
				{data.invitation.inviterEmail || 'A teammate'} invited you to join
				{data.invitation.organizationName} as {data.invitation.role}.
			</Card.Description>
		</Card.Header>
		<Card.Content class="flex flex-col gap-3">
			{#if !data.isRecipient}
				<Alert.Root>
					<Alert.Title>Wrong account</Alert.Title>
					<Alert.Description>
						This invitation was sent to {data.invitation.email}. Sign in with that account to accept
						it.
					</Alert.Description>
				</Alert.Root>
			{/if}
			{#if form?.message}
				<Alert.Root>
					<Alert.Description>{form.message}</Alert.Description>
				</Alert.Root>
			{/if}
			<p class="text-sm text-muted-foreground">Invitation sent to {data.invitation.email}.</p>
			{#if data.isRecipient && data.invitation.status === 'pending'}
				<div class="flex flex-wrap gap-2">
					<form method="POST" action="?/accept">
						<input type="hidden" name="invitationId" value={data.invitation.id} />
						<Button type="submit">Accept invitation</Button>
					</form>
					<ConfirmAction
						title="Decline invitation?"
						description="You will lose access to this invitation link."
						confirmLabel="Decline"
						action="?/reject"
						variant="outline"
						toastMessage="Invitation declined"
					>
						{#snippet fields()}
							<input type="hidden" name="invitationId" value={data.invitation.id} />
						{/snippet}
					</ConfirmAction>
				</div>
			{:else}
				<Alert.Root>
					<Alert.Description>
						This invitation is no longer pending. <a
							href={resolve('/dashboard')}
							class="underline underline-offset-4"
						>
							Go to dashboard
						</a>
					</Alert.Description>
				</Alert.Root>
			{/if}
		</Card.Content>
	</Card.Root>
</AuthShell>
