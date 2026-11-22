<script lang="ts">
	import * as Field from '#lib/components/ui/field/index.js';
	import * as Form from '#lib/components/ui/form/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { untrack } from 'svelte';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import type { ForgotPasswordSchema } from '../schema.js';
	import { createForgotPasswordForm } from '../state/forgot-password-form.svelte.js';

	let { form: initialForm }: { form: SuperValidated<Infer<ForgotPasswordSchema>> } = $props();

	const form = untrack(() => createForgotPasswordForm(initialForm));
	const { form: formData, enhance, message, submitting } = form;
</script>

<form method="POST" use:enhance class="flex flex-col gap-6">
	<Field.Group>
		<div class="flex flex-col items-center gap-1 text-center">
			<h1 class="text-2xl font-bold">Forgot your password?</h1>
			<p class="text-sm text-balance text-muted-foreground">
				Enter your email and we will send you a reset link.
			</p>
		</div>
		<Form.Field {form} name="email">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Email</Form.Label>
					<Input {...props} bind:value={$formData.email} placeholder="m@example.com" required />
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
			{$submitting ? 'Sending...' : 'Send reset link'}
		</Form.Button>
	</Field.Group>
</form>
