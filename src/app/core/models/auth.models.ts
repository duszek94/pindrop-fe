export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  email: string;
  firstName: string;
}

export interface MessageResponse {
  message: string;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string>;
}

export interface AuthUser {
  email: string;
  firstName: string;
}

export interface StoredAuthSession {
  accessToken: string;
  tokenType: string;
  user: AuthUser;
}
