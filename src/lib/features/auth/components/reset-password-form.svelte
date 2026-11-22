<script lang="ts">
	import * as Field from '#lib/components/ui/field/index.js';
	import * as Form from '#lib/components/ui/form/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { untrack } from 'svelte';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import type { ResetPasswordSchema } from '../schema.js';
	import { createResetPasswordForm } from '../state/reset-password-form.svelte.js';

	let { form: initialForm }: { form: SuperValidated<Infer<ResetPasswordSchema>> } = $props();

	const form = untrack(() => createResetPasswordForm(initialForm));
	const { form: formData, enhance, message, submitting } = form;
</script>

<form method="POST" use:enhance class="flex flex-col gap-6">
	<input type="hidden" name="token" value={$formData.token} />
	<Field.Group>
		<div class="flex flex-col items-center gap-1 text-center">
			<h1 class="text-2xl font-bold">Set a new password</h1>
			<p class="text-sm text-balance text-muted-foreground">
				Choose a strong password for your account.
			</p>
		</div>
		<Form.Field {form} name="password">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>New password</Form.Label>
					<Input {...props} bind:value={$formData.password} type="password" required />
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
			{$submitting ? 'Saving...' : 'Reset password'}
		</Form.Button>
	</Field.Group>
</form>
