import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, finalize, of, switchMap } from 'rxjs';

import { PlanTripApiService } from '../../../../core/api/plan-trip-api.service';
import type { DayBlock, DayBlockKind, DayPin, ExternalLinkType } from '../../../../core/models/plan-trip.models';
import { DashboardStore } from '../../../dashboard/services/dashboard.store';
import { DayMinimapComponent } from '../../components/day-minimap/day-minimap';
import { PlanTripStore } from '../../services/plan-trip.store';
import { pinRoleLabel, playbookLabel, toDayPlan } from '../../utils/day-plan.mapper';

@Component({
  selector: 'app-trip-itinerary-page',
  imports: [DatePipe, TranslatePipe, DayMinimapComponent],
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

  protected readonly dayPlan = computed(() => {
    const itinerary = this.itinerary();
    if (!itinerary) {
      return null;
    }
    return toDayPlan(itinerary, this.selectedDay());
  });

  protected readonly mapPins = computed(() => {
    return (this.dayPlan()?.blocks ?? []).flatMap((block) => block.pins).filter((pin) => pin.lat != null && pin.lng != null);
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

  protected formatBlockTime(block: DayBlock): string {
    const start = block.startTime?.slice(0, 5) ?? '';
    if (block.flexibility === 'FLEXIBLE' || block.flexibility === 'WINDOW') {
      return `~${start}`;
    }
    if (block.endTime) {
      return `${start}–${block.endTime.slice(0, 5)}`;
    }
    return start;
  }

  protected kindLabel(kind: DayBlockKind): string {
    return playbookLabel(kind);
  }

  protected roleLabel(role: DayPin['role']): string {
    return pinRoleLabel(role);
  }

  protected shouldShowPhoto(block: DayBlock): boolean {
    return !!block.photoUrl && block.photoConfidence === 'HIGH';
  }

  protected hideBrokenPhoto(block: DayBlock): void {
    block.photoConfidence = 'NONE';
    block.photoUrl = null;
  }

  protected externalLinkLabel(type: ExternalLinkType): string {
    const labels: Record<ExternalLinkType, string> = {
      ALLTRAILS: 'planTrip.itinerary.links.allTrails',
      WIKILOC: 'planTrip.itinerary.links.wikiloc',
      ARTICLE: 'planTrip.itinerary.links.article',
      MAPS: 'planTrip.itinerary.links.maps',
      YOUTUBE: 'planTrip.itinerary.links.youtube',
      TICKETS: 'planTrip.itinerary.links.tickets',
      OTHER: 'planTrip.itinerary.links.other',
    };
    return labels[type] ?? labels.OTHER;
  }

  protected statsLine(): string | null {
    const plan = this.dayPlan();
    if (!plan) {
      return null;
    }
    const parts: string[] = [];
    if (plan.stats.durationLabel) {
      parts.push(plan.stats.durationLabel);
    }
    if (plan.stats.distanceKm != null) {
      parts.push(`~${plan.stats.distanceKm} km`);
    }
    if (plan.stats.elevationM != null) {
      parts.push(`+${plan.stats.elevationM} m`);
    }
    if (plan.stats.costMin != null && plan.stats.costMax != null) {
      parts.push(`€${plan.stats.costMin}–${plan.stats.costMax}`);
    }
    return parts.length ? parts.join(' · ') : null;
  }

  protected selectDay(dayNumber: number): void {
    const tripId = Number(this.route.snapshot.paramMap.get('tripId'));
    this.loadDay(tripId, dayNumber);
  }

  protected regenerateDay(): void {
    const tripId = Number(this.route.snapshot.paramMap.get('tripId'));
    const day = this.selectedDay();
    this.store.loading.set(true);
    this.planTripApi
      .regenerateDay(tripId, day)
      .pipe(
        catchError(() =>
          this.planTripApi.regenerateItinerary(tripId).pipe(
            switchMap(() => this.planTripApi.getItinerary(tripId, day)),
            switchMap((itinerary) => of(toDayPlan(itinerary, day))),
          ),
        ),
        finalize(() => this.store.loading.set(false)),
      )
      .subscribe({
        next: () => this.loadDay(tripId, day),
        error: () => this.store.error.set('Failed to regenerate day.'),
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
      .pipe(
        switchMap((itinerary) =>
          this.planTripApi.getDayPlan(tripId, day).pipe(
            catchError(() => of(null)),
            switchMap((dayPlan) => of({ ...itinerary, dayPlan: dayPlan ?? itinerary.dayPlan ?? null })),
          ),
        ),
        finalize(() => this.store.loading.set(false)),
      )
      .subscribe({
        next: (itinerary) => {
          this.store.itinerary.set(itinerary);
          this.store.selectedDay.set(day);
        },
        error: () => this.store.error.set('Failed to load itinerary.'),
      });
  }
}
