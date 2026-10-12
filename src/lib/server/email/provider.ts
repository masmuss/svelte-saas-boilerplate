/**
 * Email transport abstraction.
 *
 * Call sites depend on this interface only. Adding a provider means adding a
 * file that implements `EmailProvider` and a case in `getProvider`; nothing at
 * the call site changes.
 */
export type EmailTemplate =
	| 'verify-email'
	| 'reset-password'
	| 'organization-invitation'
	| 'subscription-confirmed'
	| 'subscription-cancelled'
	| 'notification';

export interface EmailMessage {
	to: string;
	subject: string;
	html: string;
	text: string;
}

export interface EmailResult {
	/** Provider-side identifier, absent when the provider does not return one. */
	id?: string;
}

export interface EmailProvider {
	readonly name: string;
	send(message: EmailMessage): Promise<EmailResult>;
}
