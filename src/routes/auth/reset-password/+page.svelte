<script lang="ts">
	import { resolve } from '$app/paths';
	import { AuthShell, ResetPasswordForm } from '#lib/features/auth/index.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Reset Password | Svelte Boilerplate</title>
</svelte:head>

<AuthShell>
	<div class="flex flex-col gap-4">
		{#if !data.token}
			<p class="text-center text-sm text-destructive">This reset link is missing its token.</p>
		{/if}
		<ResetPasswordForm form={data.form} />
		<a href={resolve('/auth/login')} class="text-center text-sm underline-offset-4 hover:underline">
			Back to login
		</a>
	</div>
</AuthShell>
