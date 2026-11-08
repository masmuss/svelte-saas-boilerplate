<script lang="ts" module>
	import {
		BookOpenIcon,
		RobotIcon,
		BoundingBoxIcon,
		LifebuoyIcon,
		MapTrifoldIcon,
		PaperPlaneTiltIcon,
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
			},
			{
				title: 'Feedback',
				url: '/dashboard' as RouteId,
				icon: PaperPlaneTiltIcon
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
	import { CommandIcon } from 'phosphor-svelte';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import NavMain from './nav-main.svelte';
	import NavProjects from './nav-projects.svelte';
	import NavSecondary from './nav-secondary.svelte';
	import NavUser from './nav-user.svelte';
	import type { User } from 'better-auth';
	import type { ComponentProps } from 'svelte';

	let {
		ref = $bindable(null),
		user,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & { user: User } = $props();
</script>

<Sidebar.Root bind:ref variant="inset" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="##" {...props}>
							<div
								class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
							>
								<CommandIcon class="size-4" />
							</div>
							<div class="grid flex-1 text-start text-sm leading-tight">
								<span class="truncate font-medium">Acme Inc</span>
								<span class="truncate text-xs">Enterprise</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={data.navMain} />
		<NavProjects projects={data.projects} />
		<NavSecondary items={data.navSecondary} class="mt-auto" />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser {user} />
	</Sidebar.Footer>
</Sidebar.Root>
