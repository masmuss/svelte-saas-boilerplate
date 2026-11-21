<script lang="ts">
	import { resolve } from '$app/paths';
	import * as Field from '#lib/components/ui/field/index.js';
	import * as Form from '#lib/components/ui/form/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { cn, type WithElementRef } from '#lib/utils.js';
	import type { HTMLFormAttributes } from 'svelte/elements';
	import { untrack } from 'svelte';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import type { LoginFormSchema } from '../schema.js';
	import { createLoginForm } from '../state/login-form.svelte.js';

	let {
		ref = $bindable(null),
		form: initialForm,
		class: className,
		...restProps
	}: WithElementRef<HTMLFormAttributes> & {
		form: SuperValidated<Infer<LoginFormSchema>>;
	} = $props();

	const form = untrack(() => createLoginForm(initialForm));
	const { form: formData, enhance, message, submitting } = form;
</script>

<form
	use:enhance
	method="POST"
	class={cn('flex flex-col gap-6', className)}
	bind:this={ref}
	{...restProps}
>
	<Field.Group>
		<div class="flex flex-col items-center gap-1 text-center">
			<h1 class="text-2xl font-bold">Login to your account</h1>
			<p class="text-sm text-balance text-muted-foreground">
				Enter your email below to login to your account
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
		<Form.Field {form} name="password">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Password</Form.Label>
					<Input {...props} bind:value={$formData.password} type="password" required />
				{/snippet}
			</Form.Control>
		</Form.Field>
		{#if $message}
			<Field.Field>
				<Field.Error>{$message}</Field.Error>
			</Field.Field>
		{/if}
		<Form.Button type="submit" disabled={$submitting}
			>{$submitting ? 'Signing in...' : 'Login'}</Form.Button
		>
		<Field.Field>
			<Field.Description class="text-center">
				Don't have an account?
				<a href={resolve('/auth/signup')} class="underline underline-offset-4 hover:underline">
					Sign up
				</a>
			</Field.Description>
		</Field.Field>
	</Field.Group>
</form>
