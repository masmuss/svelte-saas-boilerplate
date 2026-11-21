<script lang="ts">
	import AuthShell from '#lib/features/auth/auth-shell.svelte';
	import SignupForm from '#lib/features/auth/signup-form.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Create Account | Svelte Boilerplate</title>
</svelte:head>

<AuthShell>
	<SignupForm form={data.form} />
</AuthShell>
