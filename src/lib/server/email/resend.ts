import type { EmailMessage, EmailProvider, EmailResult } from './provider.ts';

/**
 * Minimal Resend transport. Uses `fetch` rather than the vendor SDK so the
 * dependency stays optional until an API key is actually configured.
 */
export function createResendProvider(apiKey: string, from: string): EmailProvider {
	return {
		name: 'resend',
		async send(message: EmailMessage): Promise<EmailResult> {
			const response = await fetch('https://api.resend.com/emails', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					from,
					to: [message.to],
					subject: message.subject,
					html: message.html,
					text: message.text
				})
			});

			if (!response.ok) {
				const detail = await response.text();
				throw new Error(`Resend send failed (${response.status}): ${detail}`);
			}

			const payload = (await response.json()) as { id?: string };
			return { id: payload.id };
		}
	};
}
