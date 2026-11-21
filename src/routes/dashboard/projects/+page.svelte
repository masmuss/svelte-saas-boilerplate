<script lang="ts">
	import * as Alert from '#lib/components/ui/alert/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import { ProjectCreateForm, ProjectList } from '#lib/features/projects/index.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Projects | Svelte Boilerplate</title>
</svelte:head>

{#if !data.allowed}
	<Alert.Root>
		<Alert.Title>Access denied</Alert.Title>
		<Alert.Description>
			Your role does not include permission to view projects for this organization.
		</Alert.Description>
	</Alert.Root>
{:else}
	<div class="flex flex-col gap-6">
		<div class="flex flex-col gap-1">
			<h1 class="text-2xl font-bold">Projects</h1>
			<p class="text-sm text-muted-foreground">
				Organize work for the active organization. Access is scoped by your role.
			</p>
		</div>

		{#if data.canCreate}
			<Card.Root class="max-w-xl">
				<Card.Header>
					<Card.Title>New project</Card.Title>
					<Card.Description>Add a project to the current organization.</Card.Description>
				</Card.Header>
				<Card.Content>
					<ProjectCreateForm form={data.form} />
				</Card.Content>
			</Card.Root>
		{/if}

		<ProjectList projects={data.projects} canDelete={data.canDelete} />
	</div>
{/if}
