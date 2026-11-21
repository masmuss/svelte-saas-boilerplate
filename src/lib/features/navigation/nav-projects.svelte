<script lang="ts">
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import type { OrganizationItem } from '#lib/types.ts';
	import { CheckIcon } from 'phosphor-svelte';

	let {
		organizations,
		activeOrganizationId,
		onSelect
	}: {
		organizations: OrganizationItem[];
		activeOrganizationId: string | null;
		onSelect: (organizationId: string) => void;
	} = $props();
</script>

<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
	<Sidebar.GroupLabel>Organizations</Sidebar.GroupLabel>
	<Sidebar.Menu>
		{#each organizations as organization (organization.id)}
			<Sidebar.MenuItem>
				<Sidebar.MenuButton isActive={organization.id === activeOrganizationId}>
					{#snippet child({ props })}
						<button
							{...props}
							type="button"
							onclick={() => onSelect(organization.id)}
							aria-label={`Switch to ${organization.name}`}
						>
							<organization.logo />
							<span>{organization.name}</span>
							{#if organization.id === activeOrganizationId}
								<CheckIcon class="ms-auto" />
							{/if}
						</button>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		{/each}
	</Sidebar.Menu>
</Sidebar.Group>
