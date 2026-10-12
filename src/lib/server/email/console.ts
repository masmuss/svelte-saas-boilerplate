import { dev } from '$app/env';
import type { EmailMessage, EmailResult } from './provider.ts';

/**
 * Development transport. Logs the rendered message instead of delivering it so
 * invite and verification links stay reachable without a provider key.
 */
export const consoleProvider = {
	name: 'console',
	async send(message: EmailMessage): Promise<EmailResult> {
		if (dev) {
			console.info(`[email:${message.subject}] to=${message.to}\n${message.text}`);
		}
		return {};
	}
};
