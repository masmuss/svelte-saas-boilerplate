<script lang="ts">
	import ConfirmAction from '#lib/components/confirm-action.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import type { ProjectItem } from '#lib/types.ts';
	import FolderOpenIcon from 'phosphor-svelte/lib/FolderOpen';

	let { projects, canDelete = false }: { projects: ProjectItem[]; canDelete?: boolean } = $props();
</script>

{#if projects.length === 0}
	<Card.Root>
		<Card.Header class="flex flex-col items-center gap-2 py-8 text-center">
			<span class="flex size-12 items-center justify-center rounded-full bg-muted">
				<FolderOpenIcon class="size-6" aria-hidden={true} />
			</span>
			<Card.Title>No projects yet</Card.Title>
			<Card.Description>
				Use the New project form above to create the first project for this organization.
			</Card.Description>
		</Card.Header>
	</Card.Root>
{:else}
	<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
		{#each projects as item (item.id)}
			<Card.Root>
				<Card.Header>
					<div class="flex items-start justify-between gap-2">
						<Card.Title class="truncate">{item.name}</Card.Title>
						<Badge variant="secondary">Active</Badge>
					</div>
					<Card.Description class="line-clamp-2">
						{item.description || 'No description'}
					</Card.Description>
				</Card.Header>
				<Card.Footer class="flex items-center justify-between gap-2">
					<span class="text-xs text-muted-foreground">
						{new Date(item.createdAt).toLocaleDateString()}
					</span>
					{#if canDelete}
						<ConfirmAction
							title="Delete project?"
							description={`This permanently removes ${item.name}. This action cannot be undone.`}
							confirmLabel="Delete"
							action="?/delete"
						>
							{#snippet fields()}
								<input type="hidden" name="id" value={item.id} />
							{/snippet}
						</ConfirmAction>
					{/if}
				</Card.Footer>
			</Card.Root>
		{/each}
	</div>
{/if}
