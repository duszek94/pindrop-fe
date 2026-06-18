import type { AvatarUser } from '../models/avatar.models';

export function getUserInitials(user: AvatarUser | null | undefined): string {
  if (!user) {
    return '?';
  }

  const explicitInitials = user.initials?.trim();
  if (explicitInitials) {
    return explicitInitials.slice(0, 2).toUpperCase();
  }

  const firstName = user.firstName?.trim();
  if (firstName) {
    const parts = firstName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    if (firstName.length >= 2) {
      return firstName.slice(0, 2).toUpperCase();
    }

    const emailInitial = user.email?.trim()[0]?.toUpperCase() ?? '';
    return `${firstName[0]}${emailInitial}`.toUpperCase();
  }

  const email = user.email ?? '';
  const localPart = email.split('@')[0] ?? email;
  return localPart.slice(0, 2).toUpperCase();
}
