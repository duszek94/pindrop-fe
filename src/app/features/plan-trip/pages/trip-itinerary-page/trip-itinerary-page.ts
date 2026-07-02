import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';

import { PlanTripApiService } from '../../../../core/api/plan-trip-api.service';
import { DashboardStore } from '../../../dashboard/services/dashboard.store';
import { PlanTripStore } from '../../services/plan-trip.store';

@Component({
  selector: 'app-trip-itinerary-page',
  imports: [DatePipe],
  templateUrl: './trip-itinerary-page.html',
  styleUrl: './trip-itinerary-page.scss',
})
export class TripItineraryPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly planTripApi = inject(PlanTripApiService);
  private readonly store = inject(PlanTripStore);
  private readonly dashboardStore = inject(DashboardStore);

  protected readonly itinerary = this.store.itinerary;
  protected readonly selectedDay = this.store.selectedDay;
  protected readonly loading = this.store.loading;
  protected readonly error = this.store.error;

  ngOnInit(): void {
    const tripId = Number(this.route.snapshot.paramMap.get('tripId'));
    if (!tripId) {
      void this.router.navigate(['/']);
      return;
    }
    if (!this.itinerary()) {
      this.loadDay(tripId, 1);
    }
  }

  protected selectDay(dayNumber: number): void {
    const tripId = Number(this.route.snapshot.paramMap.get('tripId'));
    this.loadDay(tripId, dayNumber);
  }

  protected regenerateActivity(activityId: number): void {
    const tripId = Number(this.route.snapshot.paramMap.get('tripId'));
    this.store.loading.set(true);
    this.planTripApi
      .regenerateActivity(tripId, activityId)
      .pipe(finalize(() => this.store.loading.set(false)))
      .subscribe({
        next: (itinerary) => this.store.itinerary.set(itinerary),
        error: () => this.store.error.set('Failed to regenerate activity.'),
      });
  }

  protected regenerateAll(): void {
    const tripId = Number(this.route.snapshot.paramMap.get('tripId'));
    const day = this.selectedDay();
    this.store.loading.set(true);
    this.planTripApi
      .regenerateItinerary(tripId)
      .pipe(
        finalize(() => this.store.loading.set(false)),
        catchError(() => {
          this.store.error.set('Failed to regenerate itinerary.');
          return of(null);
        }),
      )
      .subscribe((result) => {
        if (result) {
          this.loadDay(tripId, day);
        }
      });
  }

  protected saveTrip(): void {
    const tripId = Number(this.route.snapshot.paramMap.get('tripId'));
    this.store.loading.set(true);
    this.planTripApi
      .saveTrip(tripId)
      .pipe(finalize(() => this.store.loading.set(false)))
      .subscribe({
        next: () => {
          this.dashboardStore.reload();
          void this.router.navigate(['/']);
        },
        error: () => this.store.error.set('Failed to save trip.'),
      });
  }

  protected back(): void {
    void this.router.navigate(['/plan-trip', this.route.snapshot.paramMap.get('tripId'), 'proposals']);
  }

  private loadDay(tripId: number, day: number): void {
    this.store.loading.set(true);
    this.planTripApi
      .getItinerary(tripId, day)
      .pipe(finalize(() => this.store.loading.set(false)))
      .subscribe({
        next: (itinerary) => {
          this.store.itinerary.set(itinerary);
          this.store.selectedDay.set(day);
        },
        error: () => this.store.error.set('Failed to load itinerary.'),
      });
  }
}
