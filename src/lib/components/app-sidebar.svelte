<script lang="ts" module>
	import {
		BookOpenIcon,
		RobotIcon,
		BoundingBoxIcon,
		LifebuoyIcon,
		MapTrifoldIcon,
		GearSixIcon,
		TerminalWindowIcon,
		ChartPieIcon
	} from 'phosphor-svelte';
	import type { RouteId } from '$app/types';

	const data = {
		navMain: [
			{
				title: 'Playground',
				url: '/dashboard' as RouteId,
				icon: TerminalWindowIcon,
				isActive: true,
				items: [
					{
						title: 'History',
						url: '/dashboard' as RouteId
					},
					{
						title: 'Starred',
						url: '/dashboard' as RouteId
					},
					{
						title: 'Settings',
						url: '/dashboard' as RouteId
					}
				]
			},
			{
				title: 'Models',
				url: '/dashboard' as RouteId,
				icon: RobotIcon,
				items: [
					{
						title: 'Genesis',
						url: '/dashboard' as RouteId
					},
					{
						title: 'Explorer',
						url: '/dashboard' as RouteId
					},
					{
						title: 'Quantum',
						url: '/dashboard' as RouteId
					}
				]
			},
			{
				title: 'Documentation',
				url: '/dashboard' as RouteId,
				icon: BookOpenIcon,
				items: [
					{
						title: 'Introduction',
						url: '/dashboard' as RouteId
					},
					{
						title: 'Get Started',
						url: '/dashboard' as RouteId
					},
					{
						title: 'Tutorials',
						url: '/dashboard' as RouteId
					},
					{
						title: 'Changelog',
						url: '/dashboard' as RouteId
					}
				]
			},
			{
				title: 'Settings',
				url: '/dashboard' as RouteId,
				icon: GearSixIcon,
				items: [
					{
						title: 'General',
						url: '/dashboard' as RouteId
					},
					{
						title: 'Team',
						url: '/dashboard' as RouteId
					},
					{
						title: 'Billing',
						url: '/dashboard' as RouteId
					},
					{
						title: 'Limits',
						url: '/dashboard' as RouteId
					}
				]
			}
		],
		navSecondary: [
			{
				title: 'Support',
				url: '/dashboard' as RouteId,
				icon: LifebuoyIcon
			}
		],
		projects: [
			{
				name: 'Design Engineering',
				url: '/dashboard' as RouteId,
				icon: BoundingBoxIcon
			},
			{
				name: 'Sales & Marketing',
				url: '/dashboard' as RouteId,
				icon: ChartPieIcon
			},
			{
				name: 'Travel',
				url: '/dashboard' as RouteId,
				icon: MapTrifoldIcon
			}
		]
	};
</script>

<script lang="ts">
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import NavMain from './nav-main.svelte';
	import NavProjects from './nav-projects.svelte';
	import NavUser from './nav-user.svelte';
	import OrganizationSwitcher from './organization-switcher.svelte';
	import type { ComponentProps } from 'svelte';
	import type { User } from 'better-auth';
	import type { Organization } from 'better-auth/plugins/organization';

	const organizationIcons = [BoundingBoxIcon, ChartPieIcon, MapTrifoldIcon];

	let {
		ref = $bindable(null),
		user,
		organizations,
		activeOrganizationId = null,
		collapsible = 'icon',
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & {
		user: User;
		organizations: Organization[];
		activeOrganizationId: string | null;
	} = $props();

	const organizationItems = $derived(
		organizations.map((organization, index) => ({
			...organization,
			logo: organizationIcons[index % organizationIcons.length],
			plan: 'Free'
		}))
	);
</script>

<Sidebar.Root bind:ref {collapsible} {...restProps}>
	<Sidebar.Header>
		<OrganizationSwitcher {organizationItems} {activeOrganizationId} />
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={data.navMain} />
		<NavProjects projects={data.projects} />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser {user} />
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
