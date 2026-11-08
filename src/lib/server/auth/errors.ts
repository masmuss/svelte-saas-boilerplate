import { APIError } from 'better-auth/api';

const CLIENT_ERROR_MIN = 400;
const CLIENT_ERROR_MAX = 499;

export function getAuthFailure(error: unknown, fallbackMessage: string) {
	if (!(error instanceof APIError)) {
		return { status: 500, message: 'Unexpected error' };
	}

	const status =
		error.statusCode >= CLIENT_ERROR_MIN && error.statusCode <= CLIENT_ERROR_MAX
			? error.statusCode
			: 500;

	return {
		status,
		message: status === 500 ? 'Unexpected error' : error.message || fallbackMessage
	};
}
