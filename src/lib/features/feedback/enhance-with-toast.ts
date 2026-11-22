import { applyAction, enhance } from '$app/forms';
import { refreshAll } from '$app/navigation';
import type { Action } from 'svelte/action';
import { notifySaved } from './toast.js';

export const enhanceWithToast: Action<HTMLFormElement, string> = (node, message) => {
	const lifecycle = enhance(node, () => async ({ result }) => {
		if (result.type === 'success') notifySaved(message);
		await applyAction(result);
		await refreshAll();
	});

	return { destroy: () => lifecycle.destroy() };
};
