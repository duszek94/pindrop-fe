import type { DashboardNavItem } from '../../../core/models/dashboard.models';

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { id: 'home', route: '/', icon: 'pi-home', labelKey: 'dashboard.nav.home' },
  { id: 'explore', route: '/explore', icon: 'pi-compass', labelKey: 'dashboard.nav.explore' },
  { id: 'trips', route: '/trips', icon: 'pi-map', labelKey: 'dashboard.nav.trips' },
  { id: 'favorites', route: '/favorites', icon: 'pi-heart', labelKey: 'dashboard.nav.favorites' },
  { id: 'profile', route: '/profile', icon: 'pi-user', labelKey: 'dashboard.nav.profile' },
];
