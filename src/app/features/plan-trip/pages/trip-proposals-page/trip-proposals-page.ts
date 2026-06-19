import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { catchError, finalize, of, switchMap } from 'rxjs';

import { PlanTripApiService } from '../../../../core/api/plan-trip-api.service';
import type { ProposalType, TripProposal } from '../../../../core/models/plan-trip.models';
import { PlanTripStore } from '../../services/plan-trip.store';

@Component({
  selector: 'app-trip-proposals-page',
  imports: [ButtonModule],
  templateUrl: './trip-proposals-page.html',
  styleUrl: './trip-proposals-page.scss',
})
export class TripProposalsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly planTripApi = inject(PlanTripApiService);
  private readonly store = inject(PlanTripStore);

  protected readonly proposals = this.store.proposals;
  protected readonly selectedType = this.store.selectedProposalType;
  protected readonly loading = this.store.loading;
  protected readonly error = this.store.error;

  ngOnInit(): void {
    const tripId = Number(this.route.snapshot.paramMap.get('tripId'));
    if (!tripId) {
      void this.router.navigate(['/']);
      return;
    }
    if (this.store.tripId() !== tripId) {
      this.store.initForTrip(tripId);
    }
    if (!this.proposals().length) {
      this.loadProposals(tripId);
    }
  }

  protected selectProposal(proposal: TripProposal): void {
    this.selectedType.set(proposal.type);
  }

  protected viewItinerary(): void {
    const tripId = this.store.tripId()!;
    const type = this.selectedType();
    this.store.loading.set(true);
    this.planTripApi
      .selectProposal(tripId, type)
      .pipe(
        switchMap(() => this.planTripApi.getItinerary(tripId, 1)),
        finalize(() => this.store.loading.set(false)),
      )
      .subscribe({
        next: (itinerary) => {
          this.store.itinerary.set(itinerary);
          this.store.selectedDay.set(1);
          void this.router.navigate(['/plan-trip', tripId, 'itinerary']);
        },
        error: () => this.store.error.set('Failed to load itinerary.'),
      });
  }

  protected back(): void {
    void this.router.navigate(['/plan-trip', this.store.tripId()]);
  }

  protected proposalClass(type: ProposalType): string {
    return `trip-proposals__card--${type.toLowerCase()}`;
  }

  private loadProposals(tripId: number): void {
    this.store.loading.set(true);
    this.planTripApi
      .getProposals(tripId)
      .pipe(
        finalize(() => this.store.loading.set(false)),
        catchError(() => of([])),
      )
      .subscribe((proposals) => {
        this.store.proposals.set(proposals);
        const recommended = proposals.find((p) => p.recommended);
        if (recommended) {
          this.selectedType.set(recommended.type);
        }
      });
  }
}
