import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';

import { AuthService } from '../../../../core/auth/auth.service';
import { LanguageSwitcher } from '../../../../shared/components/language-switcher/language-switcher';

@Component({
  selector: 'app-home-page',
  imports: [ButtonModule, TranslatePipe, LanguageSwitcher],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  private readonly authService = inject(AuthService);

  protected readonly user = this.authService.user;

  protected logout(): void {
    this.authService.logout();
  }
}
