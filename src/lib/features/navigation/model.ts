import type { RouteId } from '$app/types';
import type { EntitlementSummary, OrganizationItem } from '#lib/types.ts';
import { BoundingBoxIcon, ChartPieIcon, MapTrifoldIcon } from 'phosphor-svelte';
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
	entitlements: EntitlementSummary
): NavigationModel {
	const plan = entitlements.planKey ?? (entitlements.isActive ? 'Active' : 'Free');

	return {
		main: [{ title: 'Overview', url: '/dashboard', icon: ChartPieIcon, isActive: true }],
		organizations: organizations.map((organization, index) => ({
			...organization,
			logo: organizationIcons[index % organizationIcons.length],
			plan
		}))
	};
}
