<script lang="ts">
	import { resolve } from '$app/paths';
	import AuthShell from '#lib/features/auth/auth-shell.svelte';
	import { EnvelopeSimpleIcon } from 'phosphor-svelte';
</script>

<AuthShell>
	<div class="flex flex-col items-center gap-4 text-center">
		<span class="flex size-12 items-center justify-center rounded-full bg-muted">
			<EnvelopeSimpleIcon class="size-6" />
		</span>
		<h1 class="text-2xl font-bold">Check your email</h1>
		<p class="text-sm text-muted-foreground">
			We sent a verification link to your email address. Click the link to activate your account
			before signing in.
		</p>
		<a href={resolve('/auth/login')} class="text-sm underline-offset-4 hover:underline">
			Back to login
		</a>
	</div>
</AuthShell>
