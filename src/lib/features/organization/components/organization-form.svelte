<script lang="ts">
	import * as Field from '#lib/components/ui/field/index.js';
	import * as Form from '#lib/components/ui/form/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { cn } from '#lib/utils.js';
	import { untrack } from 'svelte';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import type { CreateOrganizationSchema } from '../schema.js';
	import { createOrganizationForm } from '../state/create-organization-form.svelte.js';

	let {
		form: initialForm,
		action,
		submitLabel,
		class: className
	}: {
		form: SuperValidated<Infer<CreateOrganizationSchema>>;
		action: string;
		submitLabel: string;
		class?: string;
	} = $props();

	const form = untrack(() => createOrganizationForm(initialForm));
	const { form: formData, enhance, message, submitting } = form;
</script>

<form method="POST" {action} use:enhance class={cn('flex flex-col gap-4', className)}>
	<Field.Group>
		<Form.Field {form} name="name">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Name</Form.Label>
					<Input {...props} bind:value={$formData.name} placeholder="Acme Inc." />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="slug">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Slug</Form.Label>
					<Input {...props} bind:value={$formData.slug} placeholder="acme-inc" />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		{#if $message}
			<Field.Field>
				<Field.Description>{$message}</Field.Description>
			</Field.Field>
		{/if}
		<Form.Button type="submit" disabled={$submitting}>
			{$submitting ? 'Saving...' : submitLabel}
		</Form.Button>
	</Field.Group>
</form>
