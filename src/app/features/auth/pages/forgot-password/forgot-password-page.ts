import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

import { AuthService } from '../../../../core/auth/auth.service';
import { staggerFadeSlide } from '../../../../shared/animations/auth.animations';
import {
  getFieldErrorKey,
  shouldShowFieldError,
} from '../../../../shared/utils/auth-form.validation';

@Component({
  selector: 'app-forgot-password-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    MessageModule,
  ],
  templateUrl: './forgot-password-page.html',
  styleUrl: './forgot-password-page.scss',
  animations: [staggerFadeSlide],
})
export class ForgotPasswordPage {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly loading = this.authService.loading;

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected shouldShowError(): boolean {
    return shouldShowFieldError(this.form.controls.email);
  }

  protected getErrorKey(): string | null {
    return getFieldErrorKey(this.form.controls.email, 'email');
  }

  protected submit(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authService.forgotPassword(this.form.getRawValue()).subscribe({
      next: (message) => {
        this.successMessage.set(message);
        this.form.reset();
      },
      error: (message: string) => this.errorMessage.set(message),
    });
  }
}
