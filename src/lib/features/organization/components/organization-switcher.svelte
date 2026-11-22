<script lang="ts">
	import { resolve } from '$app/paths';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import { useSidebar } from '#lib/components/ui/sidebar/index.js';
	import type { OrganizationItem } from '#lib/types.ts';
	import { CaretUpDownIcon } from 'phosphor-svelte';
	import type { OrganizationSwitcherController } from '../state/organization-switcher.svelte.js';

	let {
		organizationItems,
		activeOrganizationId,
		switcher
	}: {
		organizationItems: OrganizationItem[];
		activeOrganizationId: string | null;
		switcher: OrganizationSwitcherController;
	} = $props();

	const sidebar = useSidebar();

	const activeOrg = $derived(
		organizationItems.find((organization) => organization.id === activeOrganizationId) ??
			organizationItems[0] ??
			null
	);
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						{...props}
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					>
						{#if activeOrg}
							<div
								class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
							>
								<activeOrg.logo class="size-4" />
							</div>
							<div class="grid flex-1 text-start text-sm leading-tight">
								<span class="truncate font-medium">{activeOrg.name}</span>
								<span class="truncate text-xs">{activeOrg.plan}</span>
							</div>
						{:else}
							<div class="grid flex-1 text-start text-sm leading-tight">
								<span class="truncate font-medium">No organization</span>
								<a
									href={resolve('/dashboard/organization')}
									class="truncate text-xs underline underline-offset-4 hover:underline"
								>
									Create one to continue
								</a>
							</div>
						{/if}
						<CaretUpDownIcon class="ms-auto" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
				align="start"
				side={sidebar.isMobile ? 'bottom' : 'right'}
				sideOffset={4}
			>
				<DropdownMenu.Label class="text-xs text-muted-foreground">Organizations</DropdownMenu.Label>
				{#if switcher.error}
					<DropdownMenu.Label class="text-xs text-destructive">{switcher.error}</DropdownMenu.Label>
				{/if}
				{#each organizationItems as organization, index (organization.id)}
					<DropdownMenu.Item
						onSelect={() => void switcher.select(organization.id)}
						disabled={switcher.pending}
						class="gap-2 p-2"
					>
						<div class="flex size-6 items-center justify-center rounded-md border">
							<organization.logo class="size-3.5 shrink-0" />
						</div>
						{organization.name}
						<DropdownMenu.Shortcut>⌘{index + 1}</DropdownMenu.Shortcut>
					</DropdownMenu.Item>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
