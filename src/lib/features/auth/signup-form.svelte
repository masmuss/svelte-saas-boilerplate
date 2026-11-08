<script lang="ts">
	import * as Field from '#lib/components/ui/field/index.js';
	import * as Form from '#lib/components/ui/form/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { cn } from '#lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import { resolve } from '$app/paths';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { signupFormSchema, type SignUpFormSchema } from './schema';

	let {
		class: className,
		form: initialForm,
		...restProps
	}: HTMLAttributes<HTMLFormElement> & { form: SuperValidated<Infer<SignUpFormSchema>> } = $props();

	let form = $derived(
		superForm(initialForm, {
			validators: zod4Client(signupFormSchema)
		})
	);

	const { form: formData, enhance, message } = $derived(form);
</script>

<form use:enhance method="POST" class={cn('flex flex-col gap-6', className)} {...restProps}>
	<Field.Group>
		<div class="flex flex-col items-center gap-1 text-center">
			<h1 class="text-2xl font-bold">Create your account</h1>
			<p class="text-sm text-balance text-muted-foreground">
				Fill in the form below to create your account
			</p>
		</div>
		<Form.Field {form} name="fullName">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Full Name</Form.Label>
					<Input {...props} bind:value={$formData.fullName} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="email">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Email</Form.Label>
					<Input {...props} bind:value={$formData.email} placeholder="m@example.com" required />
				{/snippet}
			</Form.Control>
			<Form.Description>
				We'll use this to contact you. We will not share your email with anyone else.
			</Form.Description>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="password">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Password</Form.Label>
					<Input {...props} bind:value={$formData.password} type="password" required />
				{/snippet}
			</Form.Control>
			<Form.Description>Must be at least 8 characters long.</Form.Description>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="confirmPassword">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Confirm Password</Form.Label>
					<Input {...props} bind:value={$formData.confirmPassword} type="password" required />
				{/snippet}
			</Form.Control>
			<Form.Description>Please confirm your password.</Form.Description>
			<Form.FieldErrors />
		</Form.Field>
		{#if $message}
			<Field.Field>
				<Field.Error>{$message}</Field.Error>
			</Field.Field>
		{/if}
		<Form.Button>Create Account</Form.Button>
		<Field.Field>
			<Field.Description class="px-6 text-center">
				Already have an account? <a href={resolve('/auth/login')}>Sign in</a>
			</Field.Description>
		</Field.Field>
	</Field.Group>
</form>
