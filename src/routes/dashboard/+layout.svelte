<script lang="ts">
	import * as Breadcrumb from '#lib/components/ui/breadcrumb/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import { AppSidebar } from '#lib/features/navigation/index.js';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const sectionTitle = $derived(
		data.activePath === '/dashboard/projects' ? 'Projects' : 'Overview'
	);
</script>

<Sidebar.Provider>
	<AppSidebar
		user={data.user}
		organizations={data.organizations}
		activeOrganizationId={data.activeOrganizationId}
		entitlements={data.entitlements}
		permissions={data.permissions}
		activePath={data.activePath}
	/>
	<Sidebar.Inset>
		<header class="flex h-16 shrink-0 items-center gap-2">
			<div class="flex items-center gap-2 px-4">
				<Sidebar.Trigger class="-ms-1" />
				<Separator orientation="vertical" class="me-2 data-vertical:h-4 data-vertical:self-auto" />
				<Breadcrumb.Root>
					<Breadcrumb.List>
						<Breadcrumb.Item class="hidden md:block">
							<Breadcrumb.Link href="/dashboard">Dashboard</Breadcrumb.Link>
						</Breadcrumb.Item>
						<Breadcrumb.Separator class="hidden md:block" />
						<Breadcrumb.Item>
							<Breadcrumb.Page>{sectionTitle}</Breadcrumb.Page>
						</Breadcrumb.Item>
					</Breadcrumb.List>
				</Breadcrumb.Root>
			</div>
		</header>
		<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
