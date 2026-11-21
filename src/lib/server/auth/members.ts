import type { InvitationItem, MemberItem } from '#lib/types.ts';

interface RawMember {
	id: string;
	userId: string;
	role: string;
	createdAt: Date;
	user?: { name?: string; email?: string; image?: string | null } | null;
	name?: string;
	email?: string;
	image?: string | null;
}

interface RawInvitation {
	id: string;
	email: string;
	role: string | string[];
	status: string;
	createdAt: Date;
}

export function toMemberItem(member: RawMember): MemberItem {
	return {
		id: member.id,
		userId: member.userId,
		name: member.user?.name ?? member.name ?? 'Unknown',
		email: member.user?.email ?? member.email ?? '',
		image: member.user?.image ?? member.image ?? null,
		role: member.role,
		joinedAt: member.createdAt.toISOString()
	};
}

export function toInvitationItem(invitation: RawInvitation): InvitationItem {
	return {
		id: invitation.id,
		email: invitation.email,
		role: Array.isArray(invitation.role) ? invitation.role.join(', ') : invitation.role,
		status: invitation.status,
		createdAt: invitation.createdAt.toISOString()
	};
}
