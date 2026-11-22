<script lang="ts">
	import * as Alert from '#lib/components/ui/alert/index.js';
	import { BillingOverview } from '#lib/features/billing/index.js';
	import { hasPermission } from '#lib/permissions.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const allowed = $derived(hasPermission(data.permissions, 'billing:read'));
</script>

<svelte:head>
	<title>Billing | Svelte Boilerplate</title>
</svelte:head>

{#if !allowed}
	<Alert.Root>
		<Alert.Title>Access denied</Alert.Title>
		<Alert.Description
			>Your role cannot view billing information for this organization.</Alert.Description
		>
	</Alert.Root>
{:else}
	<div class="flex flex-col gap-6">
		<div class="flex flex-col gap-1">
			<h1 class="text-2xl font-bold">Billing</h1>
			<p class="text-sm text-muted-foreground">
				Plan, seats and feature entitlements for the active organization.
			</p>
		</div>
		<BillingOverview entitlements={data.entitlements} />
	</div>
{/if}
