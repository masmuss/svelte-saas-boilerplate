<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
</script>

<svelte:head>
	<title>Error | Svelte Boilerplate</title>
</svelte:head>

<main id="main-content" class="flex min-h-svh items-center justify-center px-6 py-12">
	<Card.Root class="w-full max-w-md">
		<Card.Header>
			<Card.Title>{page.status === 404 ? 'Page not found' : 'Something went wrong'}</Card.Title>
			<Card.Description>
				{page.error?.message ?? 'An unexpected error occurred. Please try again.'}
			</Card.Description>
		</Card.Header>
		<Card.Footer>
			<Button href={resolve('/')}>Go home</Button>
		</Card.Footer>
	</Card.Root>
</main>
