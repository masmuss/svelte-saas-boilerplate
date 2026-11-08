<script lang="ts">
	import { MonitorIcon, MoonIcon, PaletteIcon, SunIcon } from 'phosphor-svelte';
	import { resetMode, setMode, userPrefersMode } from 'mode-watcher';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';

	function handleModeChange(value: string) {
		if (value === 'light' || value === 'dark') {
			setMode(value);
			return;
		}

		if (value === 'system') {
			resetMode();
		}
	}
</script>

<DropdownMenu.Sub>
	<DropdownMenu.SubTrigger>
		<PaletteIcon />
		Theme
	</DropdownMenu.SubTrigger>
	<DropdownMenu.SubContent>
		<DropdownMenu.Group>
			<DropdownMenu.Label>Appearance</DropdownMenu.Label>
			<DropdownMenu.RadioGroup value={userPrefersMode.current} onValueChange={handleModeChange}>
				<DropdownMenu.RadioItem value="light">
					<SunIcon />
					Light
				</DropdownMenu.RadioItem>
				<DropdownMenu.RadioItem value="dark">
					<MoonIcon />
					Dark
				</DropdownMenu.RadioItem>
				<DropdownMenu.RadioItem value="system">
					<MonitorIcon />
					System
				</DropdownMenu.RadioItem>
			</DropdownMenu.RadioGroup>
		</DropdownMenu.Group>
	</DropdownMenu.SubContent>
</DropdownMenu.Sub>
