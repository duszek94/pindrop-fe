import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { catchError, finalize, of } from 'rxjs';

import { AiApiService } from '../../../../core/api/ai-api.service';
import { TripApiService } from '../../../../core/api/trip-api.service';
import type { SuggestedDestinationResponse } from '../../../../core/models/dashboard-api.models';
import { POPULAR_DESTINATIONS } from '../../data/popular-destinations';
import { DashboardStore } from '../../services/dashboard.store';

@Component({
  selector: 'app-dashboard-page',
  imports: [TranslatePipe, ButtonModule, RouterLink],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage implements OnInit {
  private readonly dashboardStore = inject(DashboardStore);
  private readonly router = inject(Router);
  private readonly tripApi = inject(TripApiService);
  private readonly aiApi = inject(AiApiService);

  protected readonly trips = this.dashboardStore.trips;
  protected readonly itineraries = this.dashboardStore.favoriteItineraries;
  protected readonly hasTrips = this.dashboardStore.hasTrips;
  protected readonly hasItineraries = this.dashboardStore.hasItineraries;
  protected readonly loading = this.dashboardStore.loading;
  protected readonly error = this.dashboardStore.error;
  protected readonly geoMarkerCount = signal(0);
  protected readonly creatingTrip = signal(false);
  protected readonly loadingSuggestions = signal(false);
  protected readonly suggestions = signal<SuggestedDestinationResponse[]>([]);
  protected readonly showSuggestions = signal(false);
  protected readonly popularDestinations = POPULAR_DESTINATIONS;

  ngOnInit(): void {
    this.dashboardStore.load();
    this.loadGeoMarkers();
  }

  protected startPlanTrip(): void {
    if (this.creatingTrip()) {
      return;
    }

    this.creatingTrip.set(true);
    this.tripApi
      .createDraft()
      .pipe(
        finalize(() => this.creatingTrip.set(false)),
        catchError(() => of(null)),
      )
      .subscribe((response) => {
        if (response) {
          void this.router.navigate(['/plan-trip', response.tripId]);
        }
      });
  }

  protected loadAiSuggestions(): void {
    if (this.loadingSuggestions()) {
      return;
    }

    this.loadingSuggestions.set(true);
    this.aiApi
      .getSuggestedDestinations()
      .pipe(
        finalize(() => this.loadingSuggestions.set(false)),
        catchError(() => of([])),
      )
      .subscribe((destinations) => {
        this.suggestions.set(destinations);
        this.showSuggestions.set(true);
      });
  }

  private loadGeoMarkers(): void {
    this.tripApi
      .getGeoMarkers()
      .pipe(catchError(() => of([])))
      .subscribe((markers) => this.geoMarkerCount.set(markers.length));
  }
}
