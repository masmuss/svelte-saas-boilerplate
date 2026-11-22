<script lang="ts">
	import { resolve } from '$app/paths';
	import { Button } from '#lib/components/ui/button/index.js';
</script>

<svelte:head>
	<title>Svelte Boilerplate</title>
</svelte:head>

<main
	id="main-content"
	class="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center"
>
	<div class="flex flex-col gap-2">
		<h1 class="text-3xl font-bold tracking-tight">Svelte Boilerplate</h1>
		<p class="max-w-md text-sm text-muted-foreground">
			SvelteKit starter with authentication, organizations, roles, billing entitlements and
			notifications.
		</p>
	</div>
	<div class="flex flex-wrap items-center justify-center gap-3">
		<Button href={resolve('/auth/signup')}>Create account</Button>
		<Button href={resolve('/auth/login')} variant="outline">Sign in</Button>
	</div>
</main>
