import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';

import { AuthService } from '../../../../core/auth/auth.service';
import { staggerFadeSlide } from '../../../../shared/animations/auth.animations';
import {
  AuthFieldName,
  getFieldErrorKey,
  shouldShowFieldError,
} from '../../../../shared/utils/auth-form.validation';

@Component({
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    ButtonModule,
    DividerModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    MessageModule,
    PasswordModule,
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
  animations: [staggerFadeSlide],
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly loading = this.authService.loading;

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected shouldShowError(field: AuthFieldName): boolean {
    return shouldShowFieldError(this.form.get(field));
  }

  protected getErrorKey(field: AuthFieldName): string | null {
    return getFieldErrorKey(this.form.get(field), field);
  }

  protected signInWithGoogle(): void {
    window.location.href = this.authService.getGoogleOAuthUrl();
  }

  protected submit(): void {
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        void this.router.navigate(['/']);
      },
      error: (message: string) => this.errorMessage.set(message),
    });
  }
}
