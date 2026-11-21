<script lang="ts">
	import AuthShell from '#lib/features/auth/auth-shell.svelte';
	import LoginForm from '#lib/features/auth/login-form.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Login | Svelte Boilerplate</title>
</svelte:head>

<AuthShell>
	<LoginForm form={data.form} />
</AuthShell>
