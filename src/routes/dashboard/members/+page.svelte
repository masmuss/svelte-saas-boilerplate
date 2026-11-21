<script lang="ts">
	import * as Alert from '#lib/components/ui/alert/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import { InvitationList, InviteMemberForm, MemberList } from '#lib/features/iam/index.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Members | Svelte Boilerplate</title>
</svelte:head>

{#if !data.allowed}
	<Alert.Root>
		<Alert.Title>Access denied</Alert.Title>
		<Alert.Description>
			Your role does not include permission to manage organization members.
		</Alert.Description>
	</Alert.Root>
{:else}
	<div class="flex flex-col gap-6">
		<div class="flex flex-col gap-1">
			<h1 class="text-2xl font-bold">Members</h1>
			<p class="text-sm text-muted-foreground">
				Manage who belongs to the active organization and what they can do.
			</p>
		</div>

		{#if data.canInvite}
			<Card.Root class="max-w-xl">
				<Card.Header>
					<Card.Title>Invite a member</Card.Title>
					<Card.Description>We will email an invitation to join this organization.</Card.Description
					>
				</Card.Header>
				<Card.Content>
					<InviteMemberForm form={data.form} />
				</Card.Content>
			</Card.Root>
		{/if}

		<MemberList members={data.members} canManage={data.canManage} />
		<InvitationList invitations={data.invitations} />
	</div>
{/if}
