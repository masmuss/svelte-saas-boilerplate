<script lang="ts">
	import * as Field from '#lib/components/ui/field/index.ts';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { Input } from '#lib/components/ui/input/index.ts';
	import { cn } from '#lib/utils.ts';
	import type { HTMLAttributes } from 'svelte/elements';
	import { resolve } from '$app/paths';

	let { class: className, ...restProps }: HTMLAttributes<HTMLFormElement> = $props();
</script>

<form class={cn('flex flex-col gap-6', className)} {...restProps}>
	<Field.Group>
		<div class="flex flex-col items-center gap-1 text-center">
			<h1 class="text-2xl font-bold">Create your account</h1>
			<p class="text-sm text-balance text-muted-foreground">
				Fill in the form below to create your account
			</p>
		</div>
		<Field.Field>
			<Field.Label for="name">Full Name</Field.Label>
			<Input id="name" type="text" placeholder="John Doe" required />
		</Field.Field>
		<Field.Field>
			<Field.Label for="email">Email</Field.Label>
			<Input id="email" type="email" placeholder="m@example.com" required />
			<Field.Description>
				We'll use this to contact you. We will not share your email with anyone else.
			</Field.Description>
		</Field.Field>
		<Field.Field>
			<Field.Label for="password">Password</Field.Label>
			<Input id="password" type="password" required />
			<Field.Description>Must be at least 8 characters long.</Field.Description>
		</Field.Field>
		<Field.Field>
			<Field.Label for="confirm-password">Confirm Password</Field.Label>
			<Input id="confirm-password" type="password" required />
			<Field.Description>Please confirm your password.</Field.Description>
		</Field.Field>
		<Field.Field>
			<Button type="submit">Create Account</Button>
		</Field.Field>
		<Field.Field>
			<Field.Description class="px-6 text-center">
				Already have an account? <a href={resolve('/auth/login')}>Sign in</a>
			</Field.Description>
		</Field.Field>
	</Field.Group>
</form>
