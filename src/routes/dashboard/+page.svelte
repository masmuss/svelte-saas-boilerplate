<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>

<h1 class="text-2xl font-bold">Hi, {data.user.name}!</h1>
<p class="text-sm text-muted-foreground">Your user ID is {data.user.id}.</p>
<form method="post" action="?/signOut" use:enhance>
	<button
		class="rounded-md bg-primary px-4 py-2 text-primary-foreground transition hover:bg-primary/80"
		>Sign out</button
	>
</form>
