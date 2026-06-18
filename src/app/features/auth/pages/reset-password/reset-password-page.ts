import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';

import { AuthService } from '../../../../core/auth/auth.service';
import { staggerFadeSlide } from '../../../../shared/animations/auth.animations';

@Component({
  selector: 'app-reset-password-page',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, ButtonModule, MessageModule, PasswordModule],
  templateUrl: './reset-password-page.html',
  styleUrl: './reset-password-page.scss',
  animations: [staggerFadeSlide],
})
export class ResetPasswordPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly loading = this.authService.loading;
  protected readonly token = signal('');

  protected readonly form = this.formBuilder.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
    confirmPassword: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.token.set(token);

    if (!token) {
      this.errorMessage.set('Reset token is missing or invalid.');
    }
  }

  protected submit(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (!this.token()) {
      this.errorMessage.set('Reset token is missing or invalid.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { newPassword, confirmPassword } = this.form.getRawValue();
    if (newPassword !== confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    this.authService
      .resetPassword({
        token: this.token(),
        newPassword,
      })
      .subscribe({
        next: (message) => {
          this.successMessage.set(message);
          this.form.reset();
        },
        error: (message: string) => this.errorMessage.set(message),
      });
  }
}
