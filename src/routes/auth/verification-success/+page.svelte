<script module lang="ts">
	import { resolve } from '$app/paths';
</script>

<script lang="ts">
	import { EnvelopeOpenIcon } from 'phosphor-svelte';
</script>

<div class="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
	<div class="flex size-12 items-center justify-center rounded-full bg-muted">
		<EnvelopeOpenIcon class="size-6" />
	</div>
	<h1 class="text-2xl font-bold">Email verified</h1>
	<p class="max-w-sm text-sm text-muted-foreground">
		Your email is confirmed. You can sign in now.
	</p>
	<a href={resolve('/auth/login')} class="text-sm underline-offset-4 hover:underline">
		Go to login
	</a>
</div>
