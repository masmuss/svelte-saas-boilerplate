<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Dashboard | Svelte Boilerplate</title>
</svelte:head>

<div class="grid auto-rows-min gap-4 md:grid-cols-3">
	<div class="aspect-video rounded-xl bg-muted/50"></div>
	<div class="aspect-video rounded-xl bg-muted/50"></div>
	<div class="aspect-video rounded-xl bg-muted/50"></div>
</div>
<div class="min-h-screen flex-1 rounded-xl bg-muted/50 p-6 md:min-h-min">
	<h1 class="text-2xl font-bold">Hi, {data.user.name}!</h1>
	<p class="text-sm text-muted-foreground">Your user ID is {data.user.id}.</p>
</div>
