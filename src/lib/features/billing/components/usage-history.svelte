<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import type { UsageRecordItem } from '#lib/types.ts';

	let { records }: { records: UsageRecordItem[] } = $props();
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Usage history</Card.Title>
		<Card.Description>Metered consumption for the current organization.</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if records.length === 0}
			<p class="text-sm text-muted-foreground">No usage recorded for this billing period.</p>
		{:else}
			<div class="flex flex-col gap-2">
				{#each records as record (record.id)}
					<div
						class="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
					>
						<div class="flex flex-col gap-0.5">
							<span class="font-medium">{record.metric}</span>
							<span class="text-xs text-muted-foreground">
								{new Date(record.periodStart).toLocaleDateString()} to
								{new Date(record.periodEnd).toLocaleDateString()}
							</span>
						</div>
						<span class="font-mono text-sm">{record.quantity.toLocaleString()}</span>
					</div>
				{/each}
			</div>
		{/if}
	</Card.Content>
</Card.Root>
