import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';

import { AuthService } from '../../../../core/auth/auth.service';
import { fadeIn } from '../../../../shared/animations/auth.animations';

@Component({
  selector: 'app-oauth-callback-page',
  imports: [ProgressSpinnerModule, MessageModule, TranslatePipe],
  templateUrl: './oauth-callback-page.html',
  styleUrl: './oauth-callback-page.scss',
  animations: [fadeIn],
})
export class OAuthCallbackPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly translate = inject(TranslateService);

  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.errorMessage.set(this.translate.instant('auth.oauth.failed'));
      return;
    }

    this.authService.completeOAuthLogin(token);
  }
}
