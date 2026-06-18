import { AbstractControl } from '@angular/forms';

export type AuthFieldName =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'password'
  | 'confirmPassword';

export function shouldShowFieldError(control: AbstractControl | null | undefined): boolean {
  return !!control && control.invalid && control.touched;
}

export function getFieldErrorKey(
  control: AbstractControl | null | undefined,
  field: AuthFieldName,
): string | null {
  if (!control?.errors) {
    return null;
  }

  if (control.errors['mismatch']) {
    return `validation.${field}.mismatch`;
  }

  if (control.errors['required']) {
    return `validation.${field}.required`;
  }

  if (control.errors['email']) {
    return `validation.${field}.email`;
  }

  if (control.errors['minlength']) {
    return `validation.${field}.minLength`;
  }

  return 'validation.generic';
}
