<script lang="ts">
	import { resolve } from '$app/paths';
	import { FieldGroup, Field, FieldDescription } from '#lib/components/ui/field/index.js';
	import * as Form from '#lib/components/ui/form/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { cn, type WithElementRef } from '#lib/utils.js';
	import type { HTMLFormAttributes } from 'svelte/elements';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { loginFormSchema, type LoginFormSchema } from './schema';

	let {
		ref = $bindable(null),
		form: initialForm,
		class: className,
		...restProps
	}: WithElementRef<HTMLFormAttributes> & {
		form: SuperValidated<Infer<LoginFormSchema>>;
	} = $props();

	let form = $derived(
		superForm(initialForm, {
			validators: zod4Client(loginFormSchema)
		})
	);
	const { form: formData, enhance, message, submitting } = $derived(form);
</script>

<form
	use:enhance
	method="POST"
	class={cn('flex flex-col gap-6', className)}
	bind:this={ref}
	{...restProps}
>
	<FieldGroup>
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
					<div class="flex items-center">
						<Form.Label>Password</Form.Label>
						<a href="##" class="ms-auto text-sm underline-offset-4 hover:underline">
							Forgot your password?
						</a>
					</div>
					<Input {...props} bind:value={$formData.password} type="password" required />
				{/snippet}
			</Form.Control>
		</Form.Field>
		{#if $message}
			<p class="text-sm text-destructive" role="alert">{$message}</p>
		{/if}
		<Form.Button type="submit" disabled={$submitting}
			>{$submitting ? 'Signing in...' : 'Login'}</Form.Button
		>
		<Field>
			<FieldDescription class="text-center">
				Don't have an account?
				<a href={resolve('/auth/signup')} class="underline underline-offset-4 hover:underline">
					Sign up
				</a>
			</FieldDescription>
		</Field>
	</FieldGroup>
</form>
