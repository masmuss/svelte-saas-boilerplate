import { and, eq } from 'drizzle-orm';
import { EMAIL_FROM, EMAIL_PROVIDER, RESEND_API_KEY } from '$app/env/private';
import { db } from '#lib/server/db/index.ts';
import { emailMessage } from '#lib/server/db/email.schema.ts';
import { consoleProvider } from './console.ts';
import { createResendProvider } from './resend.ts';
import type { EmailProvider, EmailTemplate } from './provider.ts';
import { renderTemplate } from './templates/index.ts';

let provider: EmailProvider | undefined;

function getProvider(): EmailProvider {
	if (provider) return provider;

	if (EMAIL_PROVIDER === 'resend' && RESEND_API_KEY) {
		provider = createResendProvider(RESEND_API_KEY, EMAIL_FROM);
	} else {
		provider = consoleProvider;
	}

	return provider;
}

/**
 * Queues an email and attempts immediate delivery.
 *
 * The row is written first so a transport failure is recorded and retryable.
 * Returns the outbox row id either way; check `status` to know the outcome.
 */
export async function sendEmail(input: {
	to: string;
	template: EmailTemplate;
	payload: Record<string, unknown>;
}): Promise<string> {
	const rendered = renderTemplate(input.template, input.payload);
	const transport = getProvider();

	const [row] = await db
		.insert(emailMessage)
		.values({
			id: crypto.randomUUID(),
			to: input.to,
			subject: rendered.subject,
			template: input.template,
			payload: input.payload,
			html: rendered.html,
			text: rendered.text
		})
		.returning();

	try {
		const result = await transport.send({
			to: input.to,
			subject: rendered.subject,
			html: rendered.html,
			text: rendered.text
		});

		await db
			.update(emailMessage)
			.set({
				status: 'sent',
				provider: transport.name,
				providerId: result.id,
				attempts: 1,
				sentAt: new Date(),
				error: null
			})
			.where(eq(emailMessage.id, row.id));
	} catch (error) {
		await db
			.update(emailMessage)
			.set({
				status: 'failed',
				provider: transport.name,
				attempts: 1,
				error: error instanceof Error ? error.message : String(error)
			})
			.where(eq(emailMessage.id, row.id));
	}

	return row.id;
}

/**
 * Retries queued and failed messages. Intended for a cron endpoint or a worker,
 * not per-request.
 */
export async function retryFailedEmails(limit = 50): Promise<number> {
	const pending = await db
		.select()
		.from(emailMessage)
		.where(and(eq(emailMessage.status, 'failed')))
		.limit(limit);

	const transport = getProvider();
	let sent = 0;

	for (const message of pending) {
		try {
			const result = await transport.send({
				to: message.to,
				subject: message.subject,
				html: message.html,
				text: message.text
			});

			await db
				.update(emailMessage)
				.set({
					status: 'sent',
					provider: transport.name,
					providerId: result.id,
					attempts: message.attempts + 1,
					sentAt: new Date(),
					error: null
				})
				.where(eq(emailMessage.id, message.id));
			sent += 1;
		} catch (error) {
			await db
				.update(emailMessage)
				.set({
					attempts: message.attempts + 1,
					error: error instanceof Error ? error.message : String(error)
				})
				.where(eq(emailMessage.id, message.id));
		}
	}

	return sent;
}
