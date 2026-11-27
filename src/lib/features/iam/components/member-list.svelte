<script lang="ts">
	import type { MemberItem } from '#lib/types.ts';
	import MemberCard from './member-card.svelte';

	let { members, canManage = false }: { members: MemberItem[]; canManage?: boolean } = $props();
</script>

<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
	{#each members as member (member.id)}
		<MemberCard {member} {canManage} />
	{/each}
</div>
