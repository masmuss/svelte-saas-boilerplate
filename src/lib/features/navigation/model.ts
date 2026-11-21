import type { RouteId } from '$app/types';
import { hasPermission } from '#lib/permissions.ts';
import type { EntitlementSummary, OrganizationItem, PermissionSet } from '#lib/types.ts';
import { BoundingBoxIcon, ChartPieIcon, MapTrifoldIcon, UsersThreeIcon } from 'phosphor-svelte';
import type { Component } from 'svelte';

export interface OrganizationSource {
	id: string;
	name: string;
}

export interface NavigationItem {
	title: string;
	url: RouteId;
	icon: Component;
	isActive?: boolean;
}

export interface NavigationModel {
	main: NavigationItem[];
	organizations: OrganizationItem[];
}

const organizationIcons = [BoundingBoxIcon, ChartPieIcon, MapTrifoldIcon];

export function buildNavigation(
	organizations: OrganizationSource[],
	entitlements: EntitlementSummary,
	permissions: PermissionSet,
	activePath: string
): NavigationModel {
	const plan = entitlements.planKey ?? (entitlements.isActive ? 'Active' : 'Free');
	const main: NavigationItem[] = [
		{
			title: 'Overview',
			url: '/dashboard',
			icon: ChartPieIcon,
			isActive: activePath === '/dashboard'
		}
	];

	if (hasPermission(permissions, 'project:read')) {
		main.push({
			title: 'Projects',
			url: '/dashboard/projects',
			icon: BoundingBoxIcon,
			isActive: activePath === '/dashboard/projects'
		});
	}

	if (hasPermission(permissions, 'ac:read')) {
		main.push({
			title: 'Members',
			url: '/dashboard/members',
			icon: UsersThreeIcon,
			isActive: activePath === '/dashboard/members'
		});
	}

	return {
		main,
		organizations: organizations.map((organization, index) => ({
			...organization,
			logo: organizationIcons[index % organizationIcons.length],
			plan
		}))
	};
}
