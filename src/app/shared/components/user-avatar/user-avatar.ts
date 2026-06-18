import { Component, computed, input } from '@angular/core';

import type { AvatarUser } from '../../models/avatar.models';
import { getUserInitials } from '../../utils/user-initials';

@Component({
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.html',
  styleUrl: './user-avatar.scss',
})
export class UserAvatar {
  readonly user = input<AvatarUser | null>(null);
  readonly size = input<'sm' | 'md'>('md');

  protected readonly initials = computed(() => getUserInitials(this.user()));
  protected readonly avatarUrl = computed(() => this.user()?.avatarUrl ?? null);
}
