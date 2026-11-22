<script lang="ts">
	import { resolve } from '$app/paths';
	import CardsThreeIcon from 'phosphor-svelte/lib/CardsThree';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="grid min-h-svh lg:grid-cols-2">
	<div class="flex flex-col gap-4 p-6 md:p-10">
		<div class="flex justify-center md:justify-start">
			<a href={resolve('/')} class="flex items-center gap-2 font-medium">
				<span
					class="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground"
				>
					<CardsThreeIcon class="size-4" />
				</span>
				Svelte Boilerplate
			</a>
		</div>
		<div class="flex flex-1 items-center justify-center">
			<div class="w-full max-w-xs">
				{@render children()}
			</div>
		</div>
	</div>
	<div class="relative hidden items-center justify-center bg-muted lg:flex" aria-hidden="true">
		<CardsThreeIcon class="size-16 text-muted-foreground/40" weight="thin" />
	</div>
</div>
