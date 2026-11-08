<script lang="ts">
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import { invalidateAll } from '$app/navigation';
	import { authClient } from '#lib/auth-client.ts';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import { useSidebar } from '#lib/components/ui/sidebar/index.js';
	import type { Component } from 'svelte';

	type Organization = {
		id: string;
		name: string;
		logo: Component<{ class?: string }>;
		plan: string;
	};

	let {
		organizationItems,
		activeOrganizationId
	}: {
		organizationItems: Organization[];
		activeOrganizationId: string | null;
	} = $props();
	const sidebar = useSidebar();

	const activeOrg = $derived(
		organizationItems.find((organization) => organization.id === activeOrganizationId) ??
			organizationItems[0] ??
			null
	);
	let switchError = $state<string | null>(null);

	async function selectOrganization(organization: Organization) {
		switchError = null;
		const result = await authClient.organization.setActive({
			organizationId: organization.id
		});

		if (result.error) {
			switchError = result.error.message ?? 'Unable to switch organization.';
			return;
		}

		await invalidateAll();
	}
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
								<span class="truncate font-medium">
									{activeOrg.name}
								</span>
								<span class="truncate text-xs">{activeOrg.plan}</span>
							</div>
						{:else}
							<div class="grid flex-1 text-start text-sm leading-tight">
								<span class="truncate font-medium">No organization</span>
								<span class="truncate text-xs">Create one to continue</span>
							</div>
						{/if}
						<ChevronsUpDownIcon class="ms-auto" />
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
				{#if switchError}
					<DropdownMenu.Label class="text-xs text-destructive">{switchError}</DropdownMenu.Label>
				{/if}
				{#each organizationItems as organization, index (organization.id)}
					<DropdownMenu.Item
						onSelect={() => void selectOrganization(organization)}
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
