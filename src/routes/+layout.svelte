<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '#lib/components/ui/sonner/index.js';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<title>Svelte Boilerplate</title>
	<meta name="description" content="SvelteKit SaaS boilerplate with authentication and IAM." />
	<link rel="icon" href={favicon} />
</svelte:head>

<a
	href="#main-content"
	class="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:shadow-md"
>
	Skip to content
</a>
<ModeWatcher />
<Toaster />
{@render children()}
