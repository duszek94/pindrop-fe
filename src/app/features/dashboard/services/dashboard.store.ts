import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, finalize, tap, throwError } from 'rxjs';

import { DashboardApiService } from '../../../core/api/dashboard-api.service';
import type { MeResponse } from '../../../core/models/dashboard-api.models';
import { mapItineraries, mapTrips } from '../utils/dashboard.mapper';

@Injectable({ providedIn: 'root' })
export class DashboardStore {
  private readonly dashboardApi = inject(DashboardApiService);

  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly loadedSignal = signal(false);
  private readonly meSignal = signal<MeResponse | null>(null);
  private readonly unreadCountSignal = signal(0);
  private readonly tripsSignal = signal<ReturnType<typeof mapTrips>>([]);
  private readonly itinerariesSignal = signal<ReturnType<typeof mapItineraries>>([]);

  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly loaded = this.loadedSignal.asReadonly();
  readonly me = this.meSignal.asReadonly();
  readonly unreadCount = this.unreadCountSignal.asReadonly();
  readonly trips = this.tripsSignal.asReadonly();
  readonly favoriteItineraries = this.itinerariesSignal.asReadonly();
  readonly hasTrips = computed(() => this.tripsSignal().length > 0);
  readonly hasItineraries = computed(() => this.itinerariesSignal().length > 0);

  load(force = false): void {
    if (this.loadingSignal()) {
      return;
    }

    if (this.loadedSignal() && !force) {
      return;
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.dashboardApi
      .getDashboard()
      .pipe(
        tap((response) => {
          this.meSignal.set(response.me);
          this.unreadCountSignal.set(response.notificationsSummary.unreadCount);
          this.tripsSignal.set(mapTrips(response.myTrips));
          this.itinerariesSignal.set(mapItineraries(response.favoriteItineraries));
          this.loadedSignal.set(true);
        }),
        finalize(() => this.loadingSignal.set(false)),
        catchError((error: unknown) => {
          this.errorSignal.set(this.extractErrorMessage(error));
          return throwError(() => error);
        }),
      )
      .subscribe();
  }

  reload(): void {
    this.load(true);
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as { message?: string } | null;
      if (body?.message) {
        return body.message;
      }

      if (error.status === 0) {
        return 'Unable to reach the server. Please try again later.';
      }
    }

    return 'Failed to load dashboard data.';
  }
}
