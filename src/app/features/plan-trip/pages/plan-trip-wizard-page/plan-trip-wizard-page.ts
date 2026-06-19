import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, debounceTime, distinctUntilChanged, finalize, of, Subject, switchMap } from 'rxjs';

import { PlanTripApiService } from '../../../../core/api/plan-trip-api.service';
import type { PlaceResult } from '../../../../core/models/plan-trip.models';
import {
  BUDGET_OPTIONS,
  INTEREST_OPTIONS,
  PACE_OPTIONS,
} from '../../../../core/models/plan-trip.models';
import {
  formatDateLocal,
  getDateFieldErrorKey,
  getDestinationErrorKey,
  minEndDate,
  parseInputDate,
  startOfToday,
  validateDestinationStep,
  type PlanTripDateField,
} from '../../../../shared/utils/trip-dates.validation';
import { WIZARD_DESTINATIONS, WIZARD_STEPS } from '../../data/wizard-destinations';
import { PlanTripStore } from '../../services/plan-trip.store';

@Component({
  selector: 'app-plan-trip-wizard-page',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './plan-trip-wizard-page.html',
  styleUrl: './plan-trip-wizard-page.scss',
})
export class PlanTripWizardPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly planTripApi = inject(PlanTripApiService);
  private readonly store = inject(PlanTripStore);
  private readonly searchQuery$ = new Subject<string>();

  protected readonly step = this.store.wizardStep;
  protected readonly destinationForm = this.store.destinationForm;
  protected readonly budgetTier = this.store.budgetTier;
  protected readonly pace = this.store.pace;
  protected readonly interests = this.store.interests;
  protected readonly loading = this.store.loading;
  protected readonly error = this.store.error;
  protected readonly placeResults = signal<PlaceResult[]>([]);
  protected readonly wizardDestinations = WIZARD_DESTINATIONS;
  protected readonly wizardSteps = WIZARD_STEPS;
  protected readonly budgetOptions = BUDGET_OPTIONS;
  protected readonly paceOptions = PACE_OPTIONS;
  protected readonly interestOptions = INTEREST_OPTIONS;
  protected readonly selectedChip = signal<string | null>(null);
  protected readonly touched = signal({
    destination: false,
    startDate: false,
    endDate: false,
  });

  protected readonly minSelectableDate = formatDateLocal(startOfToday());
  protected readonly minEndSelectableDate = computed(() => {
    const { startDate } = this.destinationForm();
    return minEndDate(startDate);
  });

  ngOnInit(): void {
    const tripId = Number(this.route.snapshot.paramMap.get('tripId'));
    if (!tripId) {
      void this.router.navigate(['/']);
      return;
    }
    this.store.initForTrip(tripId);

    this.searchQuery$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) => this.planTripApi.searchPlaces(q).pipe(catchError(() => of([])))),
      )
      .subscribe((results) => this.placeResults.set(results));
  }

  protected formatDateValue(date: Date | null): string {
    return date ? formatDateLocal(date) : '';
  }

  protected shouldShowDestinationError(): boolean {
    return this.touched().destination && !!getDestinationErrorKey(this.destinationForm());
  }

  protected getDestinationErrorKey(): string | null {
    return getDestinationErrorKey(this.destinationForm());
  }

  protected shouldShowDateError(field: PlanTripDateField): boolean {
    if (!this.touched()[field]) {
      return false;
    }

    const { startDate, endDate } = this.destinationForm();
    return !!getDateFieldErrorKey(field, startDate, endDate);
  }

  protected getDateErrorKey(field: PlanTripDateField): string | null {
    const { startDate, endDate } = this.destinationForm();
    return getDateFieldErrorKey(field, startDate, endDate);
  }

  protected onDestinationInput(value: string): void {
    this.touched.update((state) => ({ ...state, destination: true }));
    this.destinationForm.update((f) => ({ ...f, destination: value, lat: 0, lng: 0 }));
    this.selectedChip.set(null);
    this.store.error.set(null);

    if (value.length >= 2) {
      this.searchQuery$.next(value);
    } else {
      this.placeResults.set([]);
    }
  }

  protected onStartDateInput(value: string): void {
    this.touched.update((state) => ({ ...state, startDate: true }));
    this.destinationForm.update((f) => ({ ...f, startDate: parseInputDate(value) }));
    this.store.error.set(null);
  }

  protected onEndDateInput(value: string): void {
    this.touched.update((state) => ({ ...state, endDate: true }));
    this.destinationForm.update((f) => ({ ...f, endDate: parseInputDate(value) }));
    this.store.error.set(null);
  }

  protected selectPlace(place: PlaceResult): void {
    this.touched.update((state) => ({ ...state, destination: true }));
    this.destinationForm.update((f) => ({
      ...f,
      destination: place.displayName,
      lat: place.lat,
      lng: place.lng,
    }));
    this.selectedChip.set(place.name);
    this.placeResults.set([]);
    this.store.error.set(null);
  }

  protected selectPopular(name: string): void {
    this.selectedChip.set(name);
    this.planTripApi.searchPlaces(name).subscribe((results) => {
      const match = results.find((r) => r.name === name) ?? results[0];
      if (match) {
        this.selectPlace(match);
      }
    });
  }

  protected continueFromDestination(): void {
    this.touched.set({ destination: true, startDate: true, endDate: true });

    const form = this.destinationForm();
    const validationError = validateDestinationStep(form);
    if (validationError) {
      this.store.error.set(validationError);
      return;
    }

    this.store.error.set(null);
    this.store.loading.set(true);
    const tripId = this.store.tripId()!;

    this.planTripApi
      .updateDestination(tripId, {
        destination: form.destination,
        lat: form.lat,
        lng: form.lng,
        startDate: formatDateLocal(form.startDate!),
        endDate: formatDateLocal(form.endDate!),
      })
      .pipe(finalize(() => this.store.loading.set(false)))
      .subscribe({
        next: () => this.store.wizardStep.set(2),
        error: () => this.store.error.set('Failed to save destination.'),
      });
  }

  protected continueFromPreferences(): void {
    if (!this.budgetTier() || !this.pace()) {
      this.store.error.set('Please select budget and pace.');
      return;
    }
    this.store.error.set(null);
    this.store.loading.set(true);
    this.planTripApi
      .updatePreferences(this.store.tripId()!, {
        budgetTier: this.budgetTier()!,
        pace: this.pace()!,
      })
      .pipe(finalize(() => this.store.loading.set(false)))
      .subscribe({
        next: () => this.store.wizardStep.set(3),
        error: () => this.store.error.set('Failed to save preferences.'),
      });
  }

  protected toggleInterest(interest: string): void {
    const current = this.interests();
    if (current.includes(interest)) {
      this.interests.set(current.filter((i) => i !== interest));
    } else {
      this.interests.set([...current, interest]);
    }
  }

  protected generateProposals(): void {
    this.store.loading.set(true);
    this.store.error.set(null);
    const tripId = this.store.tripId()!;
    this.planTripApi
      .updateInterests(tripId, this.interests())
      .pipe(
        switchMap(() => this.planTripApi.generateProposals(tripId)),
        finalize(() => this.store.loading.set(false)),
      )
      .subscribe({
        next: (proposals) => {
          this.store.proposals.set(proposals);
          void this.router.navigate(['/plan-trip', tripId, 'proposals']);
        },
        error: () => this.store.error.set('Failed to generate proposals.'),
      });
  }

  protected back(): void {
    const current = this.step();
    if (current > 1) {
      this.store.wizardStep.set(current - 1);
    } else {
      void this.router.navigate(['/']);
    }
  }
}
