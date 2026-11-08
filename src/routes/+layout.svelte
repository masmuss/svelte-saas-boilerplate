<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';
	import { ModeWatcher } from 'mode-watcher';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<title>Svelte Boilerplate</title>
	<meta name="description" content="SvelteKit SaaS boilerplate with authentication and IAM." />
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />
{@render children()}
