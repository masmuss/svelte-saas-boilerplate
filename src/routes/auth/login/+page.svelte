<script lang="ts">
	import { AuthShell, LoginForm } from '#lib/features/auth/index.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Login | Svelte Boilerplate</title>
</svelte:head>

<AuthShell>
	<LoginForm form={data.form} />
</AuthShell>
