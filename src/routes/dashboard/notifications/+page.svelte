<script lang="ts">
	import * as Alert from '#lib/components/ui/alert/index.js';
	import { enhanceWithToast } from '#lib/features/feedback/enhance-with-toast.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { NotificationList } from '#lib/features/notifications/index.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Notifications | Svelte Boilerplate</title>
</svelte:head>

{#if !data.allowed}
	<Alert.Root>
		<Alert.Title>Access denied</Alert.Title>
		<Alert.Description>Your role cannot view notifications.</Alert.Description>
	</Alert.Root>
{:else}
	<div class="flex flex-col gap-6">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div class="flex flex-col gap-1">
				<h1 class="text-2xl font-bold">Notifications</h1>
				<p class="text-sm text-muted-foreground">
					{data.unreadCount} unread of {data.notifications.length} shown.
				</p>
			</div>
			{#if data.unreadCount > 0}
				<form method="POST" action="?/readAll" use:enhanceWithToast={'All notifications read'}>
					<Button type="submit" variant="outline">Mark all read</Button>
				</form>
			{/if}
		</div>
		<NotificationList notifications={data.notifications} canMarkRead />
	</div>
{/if}
