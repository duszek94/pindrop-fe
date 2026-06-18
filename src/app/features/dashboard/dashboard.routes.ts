import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard-page/dashboard-page').then((m) => m.DashboardPage),
  },
  {
    path: 'explore',
    loadComponent: () =>
      import('./pages/dashboard-placeholder-page/dashboard-placeholder-page').then(
        (m) => m.DashboardPlaceholderPage,
      ),
    data: {
      titleKey: 'dashboard.nav.explore',
      subtitleKey: 'dashboard.placeholder.comingSoon',
    },
  },
  {
    path: 'trips',
    loadComponent: () =>
      import('./pages/dashboard-placeholder-page/dashboard-placeholder-page').then(
        (m) => m.DashboardPlaceholderPage,
      ),
    data: {
      titleKey: 'dashboard.nav.trips',
      subtitleKey: 'dashboard.placeholder.comingSoon',
    },
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('./pages/dashboard-placeholder-page/dashboard-placeholder-page').then(
        (m) => m.DashboardPlaceholderPage,
      ),
    data: {
      titleKey: 'dashboard.nav.favorites',
      subtitleKey: 'dashboard.placeholder.comingSoon',
    },
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/dashboard-placeholder-page/dashboard-placeholder-page').then(
        (m) => m.DashboardPlaceholderPage,
      ),
    data: {
      titleKey: 'dashboard.nav.profile',
      subtitleKey: 'dashboard.placeholder.comingSoon',
    },
  },
];
