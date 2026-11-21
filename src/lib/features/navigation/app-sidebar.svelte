<script lang="ts">
	import {
		OrganizationSwitcher,
		createOrganizationSwitcher,
		type OrganizationSwitcherController
	} from '#lib/features/organization/index.js';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import type { CurrentUser, EntitlementSummary, PermissionSet } from '#lib/types.ts';
	import type { ComponentProps } from 'svelte';
	import NavMain from './nav-main.svelte';
	import NavProjects from './nav-projects.svelte';
	import NavUser from './nav-user.svelte';
	import { buildNavigation, type OrganizationSource } from './model.js';

	let {
		ref = $bindable(null),
		user,
		organizations,
		activeOrganizationId = null,
		entitlements,
		permissions,
		activePath,
		collapsible = 'icon',
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & {
		user: CurrentUser;
		organizations: OrganizationSource[];
		activeOrganizationId: string | null;
		entitlements: EntitlementSummary;
		permissions: PermissionSet;
		activePath: string;
	} = $props();

	const organizationSwitcher: OrganizationSwitcherController = createOrganizationSwitcher();
	const navigation = $derived(
		buildNavigation(organizations, entitlements, permissions, activePath)
	);
</script>

<Sidebar.Root bind:ref {collapsible} {...restProps}>
	<Sidebar.Header>
		<OrganizationSwitcher
			organizationItems={navigation.organizations}
			{activeOrganizationId}
			switcher={organizationSwitcher}
		/>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={navigation.main} />
		<NavProjects
			organizations={navigation.organizations}
			{activeOrganizationId}
			onSelect={organizationSwitcher.select}
		/>
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser {user} />
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
