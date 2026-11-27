import { json } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';

export async function GET() {
	try {
		await db.execute(sql`select 1`);
		return json({ status: 'ok' });
	} catch {
		return json({ status: 'error' }, { status: 503 });
	}
}
