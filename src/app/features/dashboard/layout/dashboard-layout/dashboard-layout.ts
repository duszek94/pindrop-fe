import { Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService } from '../../../../core/auth/auth.service';
import type { AvatarUser } from '../../../../shared/models/avatar.models';
import { UserAvatar } from '../../../../shared/components/user-avatar/user-avatar';
import { DASHBOARD_NAV_ITEMS } from '../../data/dashboard-nav';
import { DashboardStore } from '../../services/dashboard.store';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, UserAvatar],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.scss',
})
export class DashboardLayout implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly dashboardStore = inject(DashboardStore);

  protected readonly navItems = DASHBOARD_NAV_ITEMS;
  protected readonly unreadCount = this.dashboardStore.unreadCount;
  protected readonly avatarUser = computed<AvatarUser | null>(() => {
    const me = this.dashboardStore.me();
    const authUser = this.authService.user();

    if (me) {
      return {
        email: me.email,
        firstName: me.fullName,
        initials: me.initials,
        avatarUrl: me.avatarUrl,
      };
    }

    return authUser;
  });

  ngOnInit(): void {
    this.dashboardStore.load();
  }

  protected logout(): void {
    this.authService.logout();
  }
}
