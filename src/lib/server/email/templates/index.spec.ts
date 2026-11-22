import { describe, expect, it } from 'vitest';
import { renderTemplate } from './index.js';

describe('renderTemplate', () => {
	it('escapes interpolated HTML values', () => {
		const result = renderTemplate('notification', {
			title: '<b>Hello</b>',
			body: '<script>alert(1)</script>'
		});

		expect(result.html).toContain('&lt;b&gt;Hello&lt;/b&gt;');
		expect(result.html).not.toContain('<script>');
	});

	it('keeps plain text unescaped for the text part', () => {
		const result = renderTemplate('notification', {
			title: 'Hello',
			body: 'Plain body'
		});

		expect(result.text).toContain('Plain body');
		expect(result.subject).toBe('Hello');
	});
});
