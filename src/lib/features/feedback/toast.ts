import { toast } from 'svelte-sonner';

export function notifySaved(message = 'Saved successfully'): void {
	toast.success(message);
}

export function notifyError(message = 'Something went wrong'): void {
	toast.error(message);
}
