<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import type { ProjectItem } from '#lib/types.ts';
	import TrashIcon from 'phosphor-svelte/lib/Trash';

	let { projects, canDelete = false }: { projects: ProjectItem[]; canDelete?: boolean } = $props();
</script>

{#if projects.length === 0}
	<Card.Root>
		<Card.Header>
			<Card.Title>No projects yet</Card.Title>
			<Card.Description>
				Create your first project to start organizing work for this organization.
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
						<form method="POST" action="?/delete">
							<input type="hidden" name="id" value={item.id} />
							<Button type="submit" variant="ghost" size="icon" aria-label={`Delete ${item.name}`}>
								<TrashIcon />
							</Button>
						</form>
					{/if}
				</Card.Footer>
			</Card.Root>
		{/each}
	</div>
{/if}
