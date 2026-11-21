<script lang="ts">
	import * as Field from '#lib/components/ui/field/index.js';
	import * as Form from '#lib/components/ui/form/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { cn } from '#lib/utils.js';
	import type { HTMLFormAttributes } from 'svelte/elements';
	import { untrack } from 'svelte';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import type { CreateProjectSchema } from '../schema.js';
	import { createProjectForm } from '../state/create-project-form.svelte.js';

	let {
		form: initialForm,
		class: className,
		...restProps
	}: HTMLFormAttributes & { form: SuperValidated<Infer<CreateProjectSchema>> } = $props();

	const form = untrack(() => createProjectForm(initialForm));
	const { form: formData, enhance, message, submitting } = form;
</script>

<form
	method="POST"
	action="?/create"
	use:enhance
	class={cn('flex flex-col gap-4', className)}
	{...restProps}
>
	<Field.Group>
		<Form.Field {form} name="name">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Name</Form.Label>
					<Input {...props} bind:value={$formData.name} placeholder="Website redesign" required />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="description">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Description</Form.Label>
					<Input {...props} bind:value={$formData.description} placeholder="Optional" />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		{#if $message}
			<Field.Field>
				<Field.Error>{$message}</Field.Error>
			</Field.Field>
		{/if}
		<Form.Button type="submit" disabled={$submitting}>
			{$submitting ? 'Creating...' : 'Create project'}
		</Form.Button>
	</Field.Group>
</form>
