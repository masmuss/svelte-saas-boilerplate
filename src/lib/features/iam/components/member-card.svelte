<script lang="ts">
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import type { MemberItem } from '#lib/types.ts';
	import { untrack } from 'svelte';
	import { organizationRoles, type OrganizationRole } from '../schema.js';

	let { member, canManage = false }: { member: MemberItem; canManage?: boolean } = $props();

	let selectedRole = $state(untrack(() => member.role));
</script>

<Card.Root>
	<Card.Header>
		<div class="flex items-start justify-between gap-2">
			<div class="flex flex-col gap-1">
				<Card.Title class="truncate">{member.name}</Card.Title>
				<Card.Description class="truncate">{member.email}</Card.Description>
			</div>
			<Badge variant="secondary">{member.role}</Badge>
		</div>
	</Card.Header>
	<Card.Footer class="flex flex-wrap items-center justify-between gap-2">
		<span class="text-xs text-muted-foreground">
			Joined {new Date(member.joinedAt).toLocaleDateString()}
		</span>
		{#if canManage}
			<div class="flex flex-wrap items-center gap-2">
				<form method="POST" action="?/role" class="flex items-center gap-2">
					<input type="hidden" name="memberId" value={member.id} />
					<input type="hidden" name="role" value={selectedRole} />
					<Select.Root
						type="single"
						value={selectedRole}
						onValueChange={(value) => {
							if (value) selectedRole = value as OrganizationRole;
						}}
					>
						<Select.Trigger class="w-32" aria-label={`Role for ${member.name}`}>
							<Select.Value />
						</Select.Trigger>
						<Select.Content>
							{#each organizationRoles as role (role)}
								<Select.Item value={role}>{role}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					<Button type="submit" size="sm" variant="outline">Update</Button>
				</form>
				<form method="POST" action="?/remove">
					<input type="hidden" name="memberId" value={member.id} />
					<Button type="submit" size="sm" variant="ghost">Remove</Button>
				</form>
			</div>
		{/if}
	</Card.Footer>
</Card.Root>
