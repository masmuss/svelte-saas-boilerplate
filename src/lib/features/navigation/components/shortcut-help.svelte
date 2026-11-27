<script lang="ts">
	import * as AlertDialog from '#lib/components/ui/alert-dialog/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" aria-label="Keyboard shortcuts">?</Button>
		{/snippet}
	</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Keyboard shortcuts</AlertDialog.Title>
			<AlertDialog.Description>Shortcuts available in this workspace.</AlertDialog.Description>
		</AlertDialog.Header>
		<div class="flex flex-col gap-2 px-4 py-2 text-sm">
			<div class="flex items-center justify-between gap-4">
				<span>Toggle sidebar</span>
				<kbd class="rounded border px-2 py-1 font-mono text-xs">Ctrl/Cmd + B</kbd>
			</div>
			<div class="flex items-center justify-between gap-4">
				<span>Skip to content</span>
				<kbd class="rounded border px-2 py-1 font-mono text-xs">Tab then Enter</kbd>
			</div>
		</div>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Close</AlertDialog.Cancel>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
