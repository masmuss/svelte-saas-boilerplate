<script lang="ts">
	import MonitorIcon from 'phosphor-svelte/lib/Monitor';
	import MoonIcon from 'phosphor-svelte/lib/Moon';
	import PaletteIcon from 'phosphor-svelte/lib/Palette';
	import SunIcon from 'phosphor-svelte/lib/Sun';
	import { resetMode, setMode, userPrefersMode } from 'mode-watcher';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';

	type ThemeMode = 'light' | 'dark' | 'system';

	function isThemeMode(value: string): value is ThemeMode {
		return value === 'light' || value === 'dark' || value === 'system';
	}

	function handleModeChange(value: string) {
		if (!isThemeMode(value)) return;

		if (value === 'system') {
			resetMode();
			return;
		}

		setMode(value);
	}
</script>

<DropdownMenu.Sub>
	<DropdownMenu.SubTrigger>
		<PaletteIcon aria-hidden="true" />
		Theme
	</DropdownMenu.SubTrigger>
	<DropdownMenu.SubContent>
		<DropdownMenu.Group>
			<DropdownMenu.Label>Appearance</DropdownMenu.Label>
			<DropdownMenu.RadioGroup value={userPrefersMode.current} onValueChange={handleModeChange}>
				<DropdownMenu.RadioItem value="light">
					<SunIcon aria-hidden="true" />
					Light
				</DropdownMenu.RadioItem>
				<DropdownMenu.RadioItem value="dark">
					<MoonIcon aria-hidden="true" />
					Dark
				</DropdownMenu.RadioItem>
				<DropdownMenu.RadioItem value="system">
					<MonitorIcon aria-hidden="true" />
					System
				</DropdownMenu.RadioItem>
			</DropdownMenu.RadioGroup>
		</DropdownMenu.Group>
	</DropdownMenu.SubContent>
</DropdownMenu.Sub>
