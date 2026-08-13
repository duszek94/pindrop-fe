import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, finalize, of } from 'rxjs';

import { PlanTripApiService } from '../../../../core/api/plan-trip-api.service';
import type { ExpandAction, ExternalLinkType, ItineraryActivity, ItineraryDaySummary } from '../../../../core/models/plan-trip.models';
import { DashboardStore } from '../../../dashboard/services/dashboard.store';
import { PlanTripStore } from '../../services/plan-trip.store';

@Component({
  selector: 'app-trip-itinerary-page',
  imports: [DatePipe, TranslatePipe],
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

  /** Hide thin generic tip slots when the day already has concrete venues. */
  protected readonly visibleActivities = computed(() => {
    const activities = this.itinerary()?.activities ?? [];
    const hasConcrete = activities.some(
      (a) =>
        (a.type === 'ACTIVITY' || a.type === 'FOOD') &&
        a.slotKind !== 'TIP' &&
        !!a.placeName &&
        a.placeName.trim().length > 0,
    );
    if (!hasConcrete) {
      return activities;
    }
    return activities.filter((a) => {
      if (a.slotKind !== 'TIP') {
        return true;
      }
      const title = (a.title ?? '').toLowerCase();
      return !title.includes('check in and orient') && !title.includes('neighborhood walk');
    });
  });

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

  protected formatLabel(value: string): string {
    return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }

  protected formatActivityTime(activity: ItineraryActivity): string {
    const start = activity.startTime?.slice(0, 5) ?? '';
    if (activity.timeFlexibility === 'FLEXIBLE' || activity.timeFlexibility === 'WINDOW') {
      return `~${start}`;
    }
    if (activity.endTime) {
      return `${start}–${activity.endTime.slice(0, 5)}`;
    }
    return start;
  }

  protected selectedDaySummary(): ItineraryDaySummary | undefined {
    return this.itinerary()?.days.find((day) => day.dayNumber === this.selectedDay());
  }

  protected visitMeta(activity: ItineraryActivity): string | null {
    if (activity.visitStyle === 'SELF_GUIDED' && activity.routeSummary) {
      return activity.routeSummary;
    }
    return activity.formattedAddress ?? null;
  }

  protected shouldShowPhoto(activity: ItineraryActivity): boolean {
    return !!activity.photoUrl && activity.photoConfidence === 'HIGH';
  }

  protected hideBrokenPhoto(activity: ItineraryActivity): void {
    activity.photoConfidence = 'NONE';
    activity.photoUrl = null;
  }

  protected externalLinkLabel(type: ExternalLinkType): string {
    const labels: Record<ExternalLinkType, string> = {
      ALLTRAILS: 'planTrip.itinerary.links.allTrails',
      WIKILOC: 'planTrip.itinerary.links.wikiloc',
      ARTICLE: 'planTrip.itinerary.links.article',
      MAPS: 'planTrip.itinerary.links.maps',
      OTHER: 'planTrip.itinerary.links.other',
    };
    return labels[type] ?? labels.OTHER;
  }

  protected expandLabel(action: ExpandAction): string {
    const labels: Record<ExpandAction, string> = {
      EVENING_NEIGHBORHOOD_WALK: 'Generate evening walk',
      NIGHTLIFE_OPTIONS: 'Find nightlife options',
      RECOVERY_SPA: 'Find spa & recovery',
      FAMILY_ACTIVITY: 'Find family activities',
      FOOD_CRAWL: 'Plan food crawl',
      WEATHER_PLAN_B: 'Show rainy-day plan B',
      PHOTO_GOLDEN_HOUR: 'Plan golden hour route',
      LOCAL_EXPERIENCE: 'Find local experience',
    };
    return labels[action] ?? 'Generate ideas';
  }

  protected selectDay(dayNumber: number): void {
    const tripId = Number(this.route.snapshot.paramMap.get('tripId'));
    this.loadDay(tripId, dayNumber);
  }

  protected expandActivity(activityId: number): void {
    const tripId = Number(this.route.snapshot.paramMap.get('tripId'));
    this.store.loading.set(true);
    this.planTripApi
      .expandActivity(tripId, activityId)
      .pipe(finalize(() => this.store.loading.set(false)))
      .subscribe({
        next: () => this.loadDay(tripId, this.selectedDay()),
        error: () => this.store.error.set('Failed to expand activity.'),
      });
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
