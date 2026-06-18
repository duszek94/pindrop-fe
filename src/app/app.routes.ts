import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/auth/auth.guard';
import { AuthLayout } from './features/auth/layout/auth-layout/auth-layout';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/layout/dashboard-layout/dashboard-layout').then(
        (m) => m.DashboardLayout,
      ),
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'reset-password',
    component: AuthLayout,
    canActivate: [guestGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/auth/pages/reset-password/reset-password-page').then(
            (m) => m.ResetPasswordPage,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
