<script lang="ts">
	import { Badge } from '#lib/components/ui/badge/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import type { EntitlementSummary } from '#lib/types.ts';

	let { entitlements }: { entitlements: EntitlementSummary } = $props();

	const features = $derived(Object.entries(entitlements.features));
	const limits = $derived(Object.entries(entitlements.limits));
</script>

<div class="grid gap-4 md:grid-cols-2">
	<Card.Root>
		<Card.Header>
			<Card.Title>Current plan</Card.Title>
			<Card.Description>Subscription state for the active organization.</Card.Description>
		</Card.Header>
		<Card.Content class="flex flex-col gap-3">
			<div class="flex items-center justify-between gap-2">
				<span class="text-sm text-muted-foreground">Plan</span>
				<span class="font-medium">{entitlements.planKey ?? 'No active plan'}</span>
			</div>
			<div class="flex items-center justify-between gap-2">
				<span class="text-sm text-muted-foreground">Status</span>
				<Badge variant={entitlements.isActive ? 'secondary' : 'outline'}>
					{entitlements.status ?? 'inactive'}
				</Badge>
			</div>
			<div class="flex items-center justify-between gap-2">
				<span class="text-sm text-muted-foreground">Seats</span>
				<span class="font-medium">{entitlements.seats}</span>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Features</Card.Title>
			<Card.Description>Capabilities unlocked by the current plan.</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if features.length === 0}
				<p class="text-sm text-muted-foreground">No plan features configured.</p>
			{:else}
				<div class="flex flex-col gap-2">
					{#each features as [name, enabled] (name)}
						<div class="flex items-center justify-between gap-2 text-sm">
							<span>{name}</span>
							<Badge variant={enabled ? 'secondary' : 'outline'}>
								{enabled ? 'included' : 'locked'}
							</Badge>
						</div>
					{/each}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<Card.Root class="md:col-span-2">
		<Card.Header>
			<Card.Title>Limits</Card.Title>
			<Card.Description>Metered limits available on the current plan.</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if limits.length === 0}
				<p class="text-sm text-muted-foreground">No metered limits configured.</p>
			{:else}
				<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{#each limits as [metric, limit] (metric)}
						<div class="flex items-center justify-between rounded-md border p-3 text-sm">
							<span class="text-muted-foreground">{metric}</span>
							<span class="font-medium">{limit}</span>
						</div>
					{/each}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
