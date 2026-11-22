<script lang="ts">
	import { resolve } from '$app/paths';
	import AuthShell from '#lib/features/auth/components/auth-shell.svelte';
	import EnvelopeOpenIcon from 'phosphor-svelte/lib/EnvelopeOpen';
</script>

<svelte:head>
	<title>Email Verified | Svelte Boilerplate</title>
</svelte:head>

<AuthShell>
	<div class="flex flex-col items-center gap-4 text-center">
		<span class="flex size-12 items-center justify-center rounded-full bg-muted">
			<EnvelopeOpenIcon class="size-6" />
		</span>
		<h1 class="text-2xl font-bold">Email verified</h1>
		<p class="text-sm text-muted-foreground">Your email is confirmed. You can sign in now.</p>
		<a href={resolve('/auth/login')} class="text-sm underline-offset-4 hover:underline">
			Go to login
		</a>
	</div>
</AuthShell>
