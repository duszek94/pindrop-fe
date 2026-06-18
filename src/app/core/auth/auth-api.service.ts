import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  MessageResponse,
  RegisterRequest,
  ResetPasswordRequest,
} from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/auth`;

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request);
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, request);
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/forgot-password`, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/reset-password`, request);
  }
}
