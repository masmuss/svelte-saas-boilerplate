<script lang="ts">
	import { AuthShell, SignupForm } from '#lib/features/auth/index.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Create Account | Svelte Boilerplate</title>
</svelte:head>

<AuthShell>
	<SignupForm form={data.form} />
</AuthShell>
