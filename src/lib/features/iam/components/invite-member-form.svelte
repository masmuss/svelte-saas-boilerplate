<script lang="ts">
	import * as Field from '#lib/components/ui/field/index.js';
	import * as Form from '#lib/components/ui/form/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import { cn } from '#lib/utils.js';
	import { untrack } from 'svelte';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import { organizationRoles, type InviteMemberSchema, type OrganizationRole } from '../schema.js';
	import { createInviteMemberForm } from '../state/invite-member-form.svelte.js';

	let {
		form: initialForm,
		class: className
	}: { form: SuperValidated<Infer<InviteMemberSchema>>; class?: string } = $props();

	const form = untrack(() => createInviteMemberForm(initialForm));
	const { form: formData, enhance, message, submitting } = form;
</script>

<form method="POST" action="?/invite" use:enhance class={cn('flex flex-col gap-4', className)}>
	<Field.Group>
		<Form.Field {form} name="email">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Email</Form.Label>
					<Input {...props} bind:value={$formData.email} placeholder="teammate@example.com" />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Field.Field>
			<Field.FieldLabel>Role</Field.FieldLabel>
			<Select.Root
				type="single"
				value={$formData.role}
				onValueChange={(value) => {
					if (value) $formData.role = value as OrganizationRole;
				}}
			>
				<Select.Trigger class="w-full">
					<Select.Value placeholder="Select a role" />
				</Select.Trigger>
				<Select.Content>
					{#each organizationRoles as role (role)}
						<Select.Item value={role}>{role}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</Field.Field>
		{#if $message}
			<Field.Field>
				<Field.Description>{$message}</Field.Description>
			</Field.Field>
		{/if}
		<Form.Button type="submit" disabled={$submitting}>
			{$submitting ? 'Sending...' : 'Send invitation'}
		</Form.Button>
	</Field.Group>
</form>
