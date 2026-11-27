<script lang="ts">
	import { resolve } from '$app/paths';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import { OrganizationForm } from '#lib/features/organization/index.js';
	import { hasPermission } from '#lib/permissions.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const canUpdate = $derived(hasPermission(data.permissions, 'organization:update'));
</script>

<svelte:head>
	<title>Organization | Svelte Boilerplate</title>
</svelte:head>

<div class="flex flex-col gap-6">
	{#if data.activeOrganization}
		<div class="flex flex-col gap-1">
			<h1 class="text-2xl font-bold">Organization</h1>
			<p class="text-sm text-muted-foreground">
				Settings for {data.activeOrganization.name}.
			</p>
		</div>

		<Card.Root class="max-w-xl">
			<Card.Header>
				<Card.Title>Details</Card.Title>
				<Card.Description>Slug: {data.activeOrganization.slug}</Card.Description>
			</Card.Header>
			<Card.Content class="flex flex-col gap-4">
				{#if canUpdate}
					<OrganizationForm
						form={data.updateForm}
						action="?/update"
						submitLabel="Save organization"
					/>
				{:else}
					<p class="text-sm text-muted-foreground">Your role cannot change organization details.</p>
				{/if}
				<Button href={resolve('/dashboard/members')} variant="outline">Manage members</Button>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="flex flex-col gap-1">
			<h1 class="text-2xl font-bold">Create an organization</h1>
			<p class="text-sm text-muted-foreground">
				Organizations scope members, projects, billing and notifications.
			</p>
		</div>
		<Card.Root class="max-w-xl">
			<Card.Header>
				<Card.Title>New organization</Card.Title>
				<Card.Description>You will become the owner of the new organization.</Card.Description>
			</Card.Header>
			<Card.Content>
				<OrganizationForm
					form={data.createForm}
					action="?/create"
					submitLabel="Create organization"
				/>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
