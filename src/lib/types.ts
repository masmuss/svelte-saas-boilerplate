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
	status: string | null;
	isActive: boolean;
	seats: number;
	limits: Record<string, number>;
	features: Record<string, boolean>;
}

export interface OrganizationItem {
	id: string;
	name: string;
	logo: Component<{ class?: string; 'aria-hidden'?: boolean }>;
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

export interface NotificationItem {
	id: string;
	title: string;
	body: string;
	href: string | null;
	audience: string;
	organizationId: string | null;
	data: Record<string, unknown>;
	createdAt: string;
	readAt: string | null;
}
