import { Injectable } from '@angular/core';

import type { AuthResponse, AuthUser, StoredAuthSession } from '../models/auth.models';

const STORAGE_KEY = 'pindrop.auth.session';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  getSession(): StoredAuthSession | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as StoredAuthSession;
    } catch {
      this.clearSession();
      return null;
    }
  }

  saveSession(session: StoredAuthSession): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  getAccessToken(): string | null {
    return this.getSession()?.accessToken ?? null;
  }

  clearSession(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function toStoredSession(response: AuthResponse): StoredAuthSession {
  const user: AuthUser = {
    email: response.email,
    firstName: response.firstName,
  };

  return {
    accessToken: response.accessToken,
    tokenType: response.tokenType,
    user,
  };
}

export function toStoredSessionFromToken(
  accessToken: string,
  email: string,
  firstName = '',
): StoredAuthSession {
  return {
    accessToken,
    tokenType: 'Bearer',
    user: { email, firstName },
  };
}
