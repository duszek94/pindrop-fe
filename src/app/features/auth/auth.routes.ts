import { Routes } from '@angular/router';

import { guestGuard } from '../../core/auth/auth.guard';
import { AuthLayout } from './layout/auth-layout/auth-layout';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthLayout,
    canActivate: [guestGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/login/login-page').then((m) => m.LoginPage),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/register/register-page').then((m) => m.RegisterPage),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./pages/forgot-password/forgot-password-page').then(
            (m) => m.ForgotPasswordPage,
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./pages/reset-password/reset-password-page').then(
            (m) => m.ResetPasswordPage,
          ),
      },
    ],
  },
  {
    path: 'oauth2/callback',
    loadComponent: () =>
      import('./pages/oauth-callback/oauth-callback-page').then(
        (m) => m.OAuthCallbackPage,
      ),
  },
];
