<script lang="ts">
	import { enhanceWithToast } from '#lib/features/feedback/enhance-with-toast.js';
	import * as AlertDialog from '#lib/components/ui/alert-dialog/index.js';
	import { Button, type ButtonVariant } from '#lib/components/ui/button/index.js';
	import type { Snippet } from 'svelte';

	let {
		title,
		description,
		confirmLabel,
		action,
		fields,
		variant = 'destructive',
		toastMessage
	}: {
		title: string;
		description: string;
		confirmLabel: string;
		action: string;
		fields?: Snippet;
		variant?: ButtonVariant;
		toastMessage?: string;
	} = $props();
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger>
		{#snippet child({ props })}
			<Button {...props} {variant} size="sm">{confirmLabel}</Button>
		{/snippet}
	</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{title}</AlertDialog.Title>
			<AlertDialog.Description>{description}</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<form
				method="POST"
				{action}
				use:enhanceWithToast={toastMessage ?? `${confirmLabel} completed`}
			>
				{@render fields?.()}
				<AlertDialog.Action type="submit" {variant}>{confirmLabel}</AlertDialog.Action>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
