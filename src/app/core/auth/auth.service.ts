import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import type {
  ApiErrorResponse,
  AuthResponse,
  AuthUser,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from '../models/auth.models';
import { AuthApiService } from './auth-api.service';
import {
  TokenStorageService,
  toStoredSession,
  toStoredSessionFromToken,
} from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authApi = inject(AuthApiService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);

  private readonly userSignal = signal<AuthUser | null>(this.tokenStorage.getSession()?.user ?? null);
  private readonly loadingSignal = signal(false);

  readonly user = this.userSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.runAuthRequest(this.authApi.login(request));
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.runAuthRequest(this.authApi.register(request));
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<string> {
    this.loadingSignal.set(true);

    return this.authApi.forgotPassword(request).pipe(
      map((response) => response.message),
      finalize(() => this.loadingSignal.set(false)),
      catchError((error) => throwError(() => this.extractErrorMessage(error))),
    );
  }

  resetPassword(request: ResetPasswordRequest): Observable<string> {
    this.loadingSignal.set(true);

    return this.authApi.resetPassword(request).pipe(
      map((response) => response.message),
      finalize(() => this.loadingSignal.set(false)),
      catchError((error) => throwError(() => this.extractErrorMessage(error))),
    );
  }

  completeOAuthLogin(accessToken: string): void {
    const email = this.extractEmailFromToken(accessToken);
    const session = toStoredSessionFromToken(accessToken, email);
    this.persistSession(session);
    void this.router.navigate(['/']);
  }

  logout(): void {
    this.tokenStorage.clearSession();
    this.userSignal.set(null);
    void this.router.navigate(['/auth/login']);
  }

  getGoogleOAuthUrl(): string {
    return environment.googleOAuthUrl;
  }

  extractErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as ApiErrorResponse | null;
      if (body?.message) {
        return body.message;
      }

      if (error.status === 0) {
        return 'Unable to reach the server. Please try again later.';
      }
    }

    return 'Something went wrong. Please try again.';
  }

  private runAuthRequest(request$: Observable<AuthResponse>): Observable<AuthResponse> {
    this.loadingSignal.set(true);

    return request$.pipe(
      tap((response) => this.persistSession(toStoredSession(response))),
      finalize(() => this.loadingSignal.set(false)),
      catchError((error) => throwError(() => this.extractErrorMessage(error))),
    );
  }

  private persistSession(session: ReturnType<typeof toStoredSession>): void {
    this.tokenStorage.saveSession(session);
    this.userSignal.set(session.user);
  }

  private extractEmailFromToken(token: string): string {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as {
        sub?: string;
      };
      return decoded.sub ?? '';
    } catch {
      return '';
    }
  }
}
