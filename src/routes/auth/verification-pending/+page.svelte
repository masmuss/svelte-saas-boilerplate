<script module lang="ts">
	import { resolve } from '$app/paths';
</script>

<script lang="ts">
	import { EnvelopeSimpleIcon } from 'phosphor-svelte';
</script>

<div class="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
	<div class="flex size-12 items-center justify-center rounded-full bg-muted">
		<EnvelopeSimpleIcon class="size-6" />
	</div>
	<h1 class="text-2xl font-bold">Check your email</h1>
	<p class="max-w-sm text-sm text-muted-foreground">
		We sent a verification link to your email address. Click the link to activate your account
		before signing in.
	</p>
	<a href={resolve('/auth/login')} class="text-sm underline-offset-4 hover:underline">
		Back to login
	</a>
</div>
