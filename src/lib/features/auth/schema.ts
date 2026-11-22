import { z } from 'zod';

const emailSchema = z.email('Invalid email address').lowercase().trim();

const passwordSchema = z
	.string()
	.min(8, 'Password must be at least 8 characters')
	.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
	.regex(/[a-z]/, 'Password must contain at least one lowercase letter')
	.regex(/[0-9]/, 'Password must contain at least one number')
	.regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const signupFormSchema = z
	.object({
		fullName: z
			.string()
			.min(2, 'Name must be at least 2 characters')
			.max(50, 'Name must be at most 50 characters')
			.trim(),
		email: emailSchema,
		password: passwordSchema,
		confirmPassword: z.string().min(8, 'Password must be at least 8 characters')
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword']
	});

export type SignUpFormSchema = typeof signupFormSchema;

export const loginFormSchema = z.object({
	email: emailSchema,
	password: z.string()
});

export type LoginFormSchema = typeof loginFormSchema;

export const forgotPasswordSchema = z.object({
	email: emailSchema
});

export type ForgotPasswordSchema = typeof forgotPasswordSchema;

export const resetPasswordSchema = z.object({
	password: passwordSchema,
	token: z.string().min(1, 'Reset token is required')
});

export type ResetPasswordSchema = typeof resetPasswordSchema;
