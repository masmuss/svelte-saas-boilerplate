import type { Component } from 'svelte';

export interface CurrentUser {
	id: string;
	name: string;
	email: string;
	image: string | null;
}

export type PermissionSet = Record<string, string[]>;

export interface EntitlementSummary {
	planKey: string | null;
	isActive: boolean;
	features: Record<string, boolean>;
}

export interface OrganizationItem {
	id: string;
	name: string;
	logo: Component<{ class?: string }>;
	plan: string;
}

export interface ProjectItem {
	id: string;
	name: string;
	description: string | null;
	createdAt: string;
}

export interface MemberItem {
	id: string;
	userId: string;
	name: string;
	email: string;
	image: string | null;
	role: string;
	joinedAt: string;
}

export interface InvitationItem {
	id: string;
	email: string;
	role: string;
	status: string;
	createdAt: string;
}
