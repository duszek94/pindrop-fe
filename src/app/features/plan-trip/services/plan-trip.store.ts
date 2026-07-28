import { Injectable, signal } from '@angular/core';

import type {
  PreferenceProfile,
  ProposalType,
  TripItinerary,
  TripProposal,
  WizardDestinationForm,
} from '../../../core/models/plan-trip.models';
import { createDefaultPreferenceProfile } from '../../../core/models/plan-trip.models';
import { createDefaultDestinationForm } from '../../../shared/utils/trip-dates.validation';

@Injectable({ providedIn: 'root' })
export class PlanTripStore {
  readonly tripId = signal<number | null>(null);
  readonly wizardStep = signal(1);
  readonly destinationForm = signal<WizardDestinationForm>(createDefaultDestinationForm());
  readonly preferenceProfile = signal<PreferenceProfile>(createDefaultPreferenceProfile());
  readonly travelerCount = signal(1);
  readonly interests = signal<string[]>([]);
  readonly proposals = signal<TripProposal[]>([]);
  readonly selectedProposalType = signal<ProposalType>('BALANCED');
  readonly itinerary = signal<TripItinerary | null>(null);
  readonly selectedDay = signal(1);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  reset(): void {
    this.tripId.set(null);
    this.wizardStep.set(1);
    this.destinationForm.set(createDefaultDestinationForm());
    this.preferenceProfile.set(createDefaultPreferenceProfile());
    this.travelerCount.set(1);
    this.interests.set([]);
    this.proposals.set([]);
    this.selectedProposalType.set('BALANCED');
    this.itinerary.set(null);
    this.selectedDay.set(1);
    this.loading.set(false);
    this.error.set(null);
  }

  initForTrip(tripId: number): void {
    this.reset();
    this.tripId.set(tripId);
  }
}
