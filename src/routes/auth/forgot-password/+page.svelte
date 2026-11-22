<script lang="ts">
	import { resolve } from '$app/paths';
	import { AuthShell, ForgotPasswordForm } from '#lib/features/auth/index.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Forgot Password | Svelte Boilerplate</title>
</svelte:head>

<AuthShell>
	<div class="flex flex-col gap-4">
		<ForgotPasswordForm form={data.form} />
		<a href={resolve('/auth/login')} class="text-center text-sm underline-offset-4 hover:underline">
			Back to login
		</a>
	</div>
</AuthShell>
