<script lang="ts">
	import { resolve } from '$app/paths';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import type { NotificationItem } from '#lib/types.ts';

	let {
		notifications,
		canMarkRead = false
	}: { notifications: NotificationItem[]; canMarkRead?: boolean } = $props();

	function resolvedHref(href: string | null): string | null {
		if (!href) return null;
		return href.startsWith('http') ? href : (resolve as (route: string) => string)(href);
	}
</script>

{#if notifications.length === 0}
	<Card.Root>
		<Card.Header>
			<Card.Title>No notifications</Card.Title>
			<Card.Description>You are all caught up.</Card.Description>
		</Card.Header>
	</Card.Root>
{:else}
	<div class="flex flex-col gap-3">
		{#each notifications as notification (notification.id)}
			{@const href = resolvedHref(notification.href)}
			<Card.Root>
				<Card.Header class="flex flex-row items-start justify-between gap-3">
					<div class="flex flex-col gap-1">
						<Card.Title class="text-base">{notification.title}</Card.Title>
						<Card.Description>{notification.body}</Card.Description>
						<div class="flex items-center gap-2 pt-1">
							<Badge variant="outline">{notification.audience}</Badge>
							<span class="text-xs text-muted-foreground">
								{new Date(notification.createdAt).toLocaleString()}
							</span>
							{#if notification.readAt}
								<Badge variant="secondary">read</Badge>
							{/if}
						</div>
						{#if href}
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a {href} class="text-sm underline underline-offset-4 hover:underline"> Open </a>
						{/if}
					</div>
					{#if !notification.readAt && canMarkRead}
						<form method="POST" action="?/read">
							<input type="hidden" name="id" value={notification.id} />
							<Button type="submit" size="sm" variant="outline">Mark read</Button>
						</form>
					{/if}
				</Card.Header>
			</Card.Root>
		{/each}
	</div>
{/if}
