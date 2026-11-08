<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { Button } from '#lib/components/ui/button/index.ts';
	import {
		FieldGroup,
		Field,
		FieldLabel,
		FieldDescription
	} from '#lib/components/ui/field/index.ts';
	import { Input } from '#lib/components/ui/input/index.ts';
	import { cn, type WithElementRef } from '#lib/utils.ts';
	import type { HTMLFormAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		form = null,
		class: className,
		...restProps
	}: WithElementRef<HTMLFormAttributes> & { form?: { message?: string } | null } = $props();

	const id = $props.id();

	let submitting = $state(false);
</script>

<form
	method="post"
	action="?/signInEmail"
	use:enhance={() => {
		submitting = true;
		return async ({ update }) => {
			submitting = false;
			await update();
		};
	}}
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
		<Field>
			<FieldLabel for="email-{id}">Email</FieldLabel>
			<Input id="email-{id}" name="email" type="email" placeholder="m@example.com" required />
		</Field>
		<Field>
			<div class="flex items-center">
				<FieldLabel for="password-{id}">Password</FieldLabel>
				<a href="##" class="ms-auto text-sm underline-offset-4 hover:underline">
					Forgot your password?
				</a>
			</div>
			<Input
				id="password-{id}"
				name="password"
				type="password"
				required
				aria-invalid={form ? true : undefined}
			/>
		</Field>
		{#if form?.message}
			<p class="text-sm text-destructive" role="alert">{form.message}</p>
		{/if}
		<Field>
			<Button type="submit" disabled={submitting}>{submitting ? 'Signing in...' : 'Login'}</Button>
		</Field>
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
