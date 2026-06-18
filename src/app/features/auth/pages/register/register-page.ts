import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
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
  selector: 'app-register-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    MessageModule,
    PasswordModule,
  ],
  templateUrl: './register-page.html',
  styleUrl: './register-page.scss',
  animations: [staggerFadeSlide],
})
export class RegisterPage {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly loading = this.authService.loading;

  protected readonly form = this.formBuilder.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
    confirmPassword: ['', [Validators.required]],
  });

  protected shouldShowError(field: AuthFieldName): boolean {
    return shouldShowFieldError(this.form.get(field));
  }

  protected getErrorKey(field: AuthFieldName): string | null {
    return getFieldErrorKey(this.form.get(field), field);
  }

  protected submit(): void {
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { confirmPassword, ...payload } = this.form.getRawValue();
    if (payload.password !== confirmPassword) {
      this.form.controls.confirmPassword.setErrors({ mismatch: true });
      this.form.controls.confirmPassword.markAsTouched();
      return;
    }

    this.authService.register(payload).subscribe({
      next: () => {
        void this.router.navigate(['/']);
      },
      error: (message: string) => this.errorMessage.set(message),
    });
  }
}
