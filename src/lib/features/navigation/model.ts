import type { RouteId } from '$app/types';
import { hasPermission } from '#lib/permissions.ts';
import type { EntitlementSummary, OrganizationItem, PermissionSet } from '#lib/types.ts';
import BellIcon from 'phosphor-svelte/lib/Bell';
import BoundingBoxIcon from 'phosphor-svelte/lib/BoundingBox';
import ChartPieIcon from 'phosphor-svelte/lib/ChartPie';
import CreditCardIcon from 'phosphor-svelte/lib/CreditCard';
import GearSixIcon from 'phosphor-svelte/lib/GearSix';
import MapTrifoldIcon from 'phosphor-svelte/lib/MapTrifold';
import UsersThreeIcon from 'phosphor-svelte/lib/UsersThree';
import type { Component } from 'svelte';

export interface OrganizationSource {
	id: string;
	name: string;
}

export type NavigationRoute = Exclude<RouteId, '/accept-invitation/[id]'>;

export interface NavigationItem {
	title: string;
	url: NavigationRoute;
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

	if (hasPermission(permissions, 'billing:read')) {
		main.push({
			title: 'Billing',
			url: '/dashboard/billing',
			icon: CreditCardIcon,
			isActive: activePath === '/dashboard/billing'
		});
	}

	if (hasPermission(permissions, 'notification:read')) {
		main.push({
			title: 'Notifications',
			url: '/dashboard/notifications',
			icon: BellIcon,
			isActive: activePath === '/dashboard/notifications'
		});
	}

	if (hasPermission(permissions, 'organization:update')) {
		main.push({
			title: 'Organization',
			url: '/dashboard/organization',
			icon: GearSixIcon,
			isActive: activePath === '/dashboard/organization'
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
