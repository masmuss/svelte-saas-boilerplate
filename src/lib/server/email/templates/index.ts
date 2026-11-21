import { PUBLIC_APP_NAME } from '$app/env/public';
import type { EmailTemplate } from '../provider.js';

function escapeHtml(value: unknown): string {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function layout(title: string, body: string): { subject: string; html: string; text: string } {
	const text = `${title}\n\n${body}`;
	const html = `<!doctype html>
<html>
	<body style="font-family:system-ui,sans-serif;line-height:1.5">
		<h1 style="font-size:20px">${escapeHtml(title)}</h1>
		<p>${escapeHtml(body)}</p>
		<hr />
		<p style="font-size:12px;color:#666">${escapeHtml(PUBLIC_APP_NAME)}</p>
	</body>
</html>`;

	return { subject: title, html, text };
}

export function renderTemplate(
	template: EmailTemplate,
	payload: Record<string, unknown>
): { subject: string; html: string; text: string } {
	switch (template) {
		case 'verify-email':
			return layout('Verify your email', `Confirm your address: ${payload.url}`);
		case 'reset-password':
			return layout('Reset your password', `Choose a new password: ${payload.url}`);
		case 'organization-invitation':
			return layout(
				`Invitation to ${payload.organizationName}`,
				`${payload.invitedBy} invited you to join ${payload.organizationName}. Accept it here: ${payload.inviteLink}`
			);
		case 'subscription-confirmed':
			return layout('Subscription confirmed', `Your ${payload.plan} plan is active.`);
		case 'subscription-cancelled':
			return layout('Subscription cancelled', `Your ${payload.plan} plan has been cancelled.`);
		case 'notification':
			return layout(String(payload.title ?? 'Notification'), String(payload.body ?? ''));
	}
}
