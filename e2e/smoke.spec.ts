import { expect, test } from '@playwright/test';

test('home page renders call to action', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Svelte Boilerplate' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Create account' })).toBeVisible();
});

test('login page exposes password recovery', async ({ page }) => {
	await page.goto('/auth/login');
	await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Forgot your password?' })).toBeVisible();
});

test('protected dashboard redirects to login', async ({ page }) => {
	await page.goto('/dashboard');
	await expect(page).toHaveURL(/\/auth\/login/);
});

test('health endpoint reports ok', async ({ request }) => {
	const response = await request.get('/health');
	expect(response.ok()).toBeTruthy();
	expect(await response.json()).toEqual({ status: 'ok' });
});
