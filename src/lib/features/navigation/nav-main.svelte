<script lang="ts">
	import { resolve } from '$app/paths';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import type { NavigationItem } from './model.js';

	let { items }: { items: NavigationItem[] } = $props();
</script>

<Sidebar.Group>
	<Sidebar.GroupLabel>Platform</Sidebar.GroupLabel>
	<Sidebar.Menu>
		{#each items as item (item.title)}
			<Sidebar.MenuItem>
				<Sidebar.MenuButton isActive={item.isActive} tooltipContent={item.title}>
					{#snippet child({ props })}
						<a href={resolve(item.url)} {...props}>
							<item.icon aria-hidden="true" />
							<span>{item.title}</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		{/each}
	</Sidebar.Menu>
</Sidebar.Group>
