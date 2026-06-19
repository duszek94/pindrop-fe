import { Routes } from '@angular/router';

export const PLAN_TRIP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/plan-trip-wizard-page/plan-trip-wizard-page').then((m) => m.PlanTripWizardPage),
  },
  {
    path: 'proposals',
    loadComponent: () =>
      import('./pages/trip-proposals-page/trip-proposals-page').then((m) => m.TripProposalsPage),
  },
  {
    path: 'itinerary',
    loadComponent: () =>
      import('./pages/trip-itinerary-page/trip-itinerary-page').then((m) => m.TripItineraryPage),
  },
];
