import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { TranslatePipe } from '@ngx-translate/core';

import { catchError, debounceTime, distinctUntilChanged, finalize, map, of, Subject, switchMap } from 'rxjs';



import { PlanTripApiService } from '../../../../core/api/plan-trip-api.service';

import { LanguageService } from '../../../../core/i18n/language.service';

import type {

  PaceIntensity,

  PlaceResult,

  PreferenceCategory,

  PreferenceProfile,

  SpendingPriority,

  TransportMode,

  TravelPace,

  WizardDestinationForm,

} from '../../../../core/models/plan-trip.models';

import {

  BUDGET_OPTIONS,

  INTEREST_OPTIONS,

  PACE_INTENSITIES,

  PACE_OPTIONS,

  PREFERENCE_CATEGORIES,

  SPENDING_PRIORITIES,

  TRANSPORT_MODES,

  hasCarTransportMode,

  toPreferenceProfilePayload,

  validatePreferenceProfile,

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

import { WIZARD_STEPS, DESTINATION_IMAGE_FALLBACK, resolveDestinationImage } from '../../data/wizard-destinations';

import { DestinationMapPickerComponent } from '../../components/destination-map-picker/destination-map-picker';

import { PlanTripStore } from '../../services/plan-trip.store';

import { placeTypeLabel } from '../../utils/place-type-label';



@Component({

  selector: 'app-plan-trip-wizard-page',

  imports: [FormsModule, TranslatePipe, DestinationMapPickerComponent],

  templateUrl: './plan-trip-wizard-page.html',

  styleUrl: './plan-trip-wizard-page.scss',

})

export class PlanTripWizardPage implements OnInit {

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly planTripApi = inject(PlanTripApiService);

  private readonly languageService = inject(LanguageService);

  private readonly store = inject(PlanTripStore);

  private readonly searchQuery$ = new Subject<string>();



  protected readonly step = this.store.wizardStep;

  protected readonly destinationForm = this.store.destinationForm;

  protected readonly preferenceProfile = this.store.preferenceProfile;

  protected readonly interests = this.store.interests;

  protected readonly loading = this.store.loading;

  protected readonly error = this.store.error;

  protected readonly placeResults = signal<PlaceResult[]>([]);

  protected readonly popularDestinations = signal<PlaceResult[]>([]);

  protected readonly popularDestinationsLoading = signal(true);

  protected readonly destinationImageFallback = DESTINATION_IMAGE_FALLBACK;

  protected readonly resolveDestinationImage = resolveDestinationImage;

  protected readonly wizardSteps = WIZARD_STEPS;

  protected readonly budgetOptions = BUDGET_OPTIONS;

  protected readonly paceOptions = PACE_OPTIONS;

  protected readonly interestOptions = INTEREST_OPTIONS;

  protected readonly preferenceCategories = PREFERENCE_CATEGORIES;

  protected readonly spendingPriorities = SPENDING_PRIORITIES;

  protected readonly transportModes = TRANSPORT_MODES;

  protected readonly paceIntensities = PACE_INTENSITIES;

  protected readonly selectedChip = signal<string | null>(null);

  protected readonly mapPickerOpen = signal(false);

  protected readonly additionalRequirementsExpanded = signal(false);

  protected readonly preferencesTouched = signal(false);

  protected readonly touched = signal({

    destination: false,

    startDate: false,

    endDate: false,

  });



  protected readonly hasCarMode = computed(() =>

    hasCarTransportMode(this.preferenceProfile().transportModes),

  );



  protected readonly minSelectableDate = formatDateLocal(startOfToday());

  protected readonly minEndSelectableDate = computed(() => {

    const { startDate } = this.destinationForm();

    return minEndDate(startDate);

  });



  constructor() {

    effect(() => {

      this.languageService.currentLang();

      const tripId = Number(this.route.snapshot.paramMap.get('tripId'));

      if (tripId) {

        this.loadPopularDestinations();

      }

    });



    effect(() => {

      const requirements = this.preferenceProfile().additionalRequirements;

      if (requirements && requirements.trim().length > 0) {

        this.additionalRequirementsExpanded.set(true);

      }

    });

  }



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

        switchMap((q) =>

          this.planTripApi.searchPlaces(q).pipe(

            map((results) => ({ query: q, results })),

            catchError(() => of({ query: q, results: [] as PlaceResult[] })),

          ),

        ),

      )

      .subscribe(({ query, results }) => {

        const currentQuery = this.destinationForm().destination.trim();

        if (query !== currentQuery) {

          return;

        }

        this.placeResults.set(results);

      });

  }



  protected trackPlace(place: PlaceResult, index: number): string {

    return `${index}:${place.lat}:${place.lng}:${place.displayName}`;

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



  protected categoryLabelKey(category: PreferenceCategory): string {

    return `planTrip.preferences.categories.${category.toLowerCase()}`;

  }



  protected priorityLabelKey(priority: SpendingPriority): string {

    return `planTrip.preferences.priorities.${priority.toLowerCase()}`;

  }



  protected transportLabelKey(mode: TransportMode): string {

    return `planTrip.preferences.transport.modes.${mode.toLowerCase()}`;

  }



  protected intensityLabelKey(intensity: PaceIntensity): string {

    return `planTrip.preferences.pace.intensity.${intensity.toLowerCase()}`;

  }



  protected setBudgetStyle(tier: PreferenceProfile['budgetStyle']): void {

    this.preferencesTouched.set(true);

    this.preferenceProfile.update((profile) => ({ ...profile, budgetStyle: tier }));

    this.store.error.set(null);

  }



  protected setCategoryPriority(category: PreferenceCategory, priority: SpendingPriority): void {

    this.preferencesTouched.set(true);

    this.preferenceProfile.update((profile) => ({

      ...profile,

      categoryPriorities: { ...profile.categoryPriorities, [category]: priority },

    }));

    this.store.error.set(null);

  }



  protected isTransportModeSelected(mode: TransportMode): boolean {

    return this.preferenceProfile().transportModes.includes(mode);

  }



  protected toggleTransportMode(mode: TransportMode): void {

    this.preferencesTouched.set(true);

    this.preferenceProfile.update((profile) => {

      const current = profile.transportModes;

      const transportModes = current.includes(mode)

        ? current.filter((item) => item !== mode)

        : [...current, mode];

      return { ...profile, transportModes };

    });

    this.store.error.set(null);

  }



  protected setAvoidFlying(value: boolean): void {

    this.preferenceProfile.update((profile) => ({

      ...profile,

      avoidFlyingWhenTrainReasonable: value,

    }));

  }



  protected setPace(pace: TravelPace): void {

    this.preferencesTouched.set(true);

    this.preferenceProfile.update((profile) => ({

      ...profile,

      pace,

      paceIntensity: pace === 'ACTIVE' ? profile.paceIntensity : null,

    }));

    this.store.error.set(null);

  }



  protected setPaceIntensity(intensity: PaceIntensity): void {

    this.preferencesTouched.set(true);

    this.preferenceProfile.update((profile) => ({

      ...profile,

      paceIntensity: profile.paceIntensity === intensity ? null : intensity,

    }));

    this.store.error.set(null);

  }



  protected toggleAdditionalRequirements(): void {

    this.additionalRequirementsExpanded.update((expanded) => !expanded);

  }



  protected onAdditionalRequirementsInput(value: string): void {

    this.preferenceProfile.update((profile) => ({

      ...profile,

      additionalRequirements: value.slice(0, 500),

    }));

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



  protected onDestinationBlur(): void {

    this.touched.update((state) => ({ ...state, destination: true }));

  }



  protected onSuggestionPointerDown(event: Event): void {

    event.preventDefault();

  }



  protected onDestinationEnter(event: Event): void {

    event.preventDefault();

    const results = this.placeResults();

    if (results.length > 0) {

      this.selectPlaceAt(0);

    }

  }



  protected openMapPicker(): void {

    this.mapPickerOpen.set(true);

  }



  protected closeMapPicker(): void {

    this.mapPickerOpen.set(false);

  }



  protected onMapPlaceSelected(place: PlaceResult): void {

    this.selectPlace(place);

    this.mapPickerOpen.set(false);

  }



  protected formatPlaceType(placeType: string | null | undefined): string | null {

    return placeTypeLabel(placeType);

  }



  private tryAutoSelectSuggestion(): void {

    const form = this.destinationForm();

    if (form.lat !== 0 || form.lng !== 0) {

      return;

    }



    const results = this.placeResults();

    if (results.length === 1) {

      this.selectPlace(results[0]);

    }

  }



  protected selectPlaceAt(index: number): void {

    const place = this.placeResults()[index];

    if (place) {

      this.selectPlace(place);

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



  protected selectPopular(place: PlaceResult): void {

    this.selectPlace(place);

  }



  private loadPopularDestinations(): void {

    this.popularDestinationsLoading.set(true);

    this.planTripApi

      .getPopularDestinations(6)

      .pipe(

        catchError(() => of([])),

        finalize(() => this.popularDestinationsLoading.set(false)),

      )

      .subscribe((destinations) => this.popularDestinations.set(destinations));

  }



  protected continueFromDestination(): void {

    this.touched.set({ destination: true, startDate: true, endDate: true });

    this.tryAutoSelectSuggestion();



    let form = this.destinationForm();

    const query = form.destination.trim();

    const missingCoordinates = form.lat === 0 && form.lng === 0;



    if (missingCoordinates && query.length >= 2) {

      this.store.loading.set(true);

      this.store.error.set(null);

      this.planTripApi

        .searchPlaces(query)

        .pipe(finalize(() => this.store.loading.set(false)))

        .subscribe((results) => {

          this.placeResults.set(results);

          const match = this.pickBestPlaceMatch(query, results);

          if (match) {

            this.selectPlace(match);

            form = this.destinationForm();

          }

          this.persistDestination(form);

        });

      return;

    }



    this.persistDestination(form);

  }



  private pickBestPlaceMatch(query: string, results: PlaceResult[]): PlaceResult | null {

    if (!results.length) {

      return null;

    }



    const normalized = query.toLowerCase();

    const exact = results.find((place) => place.name.toLowerCase() === normalized);

    if (exact) {

      return exact;

    }



    const partial = results.find(

      (place) =>

        place.name.toLowerCase().includes(normalized) ||

        normalized.includes(place.name.toLowerCase()),

    );

    if (partial) {

      return partial;

    }



    const regionLike = results.find(

      (place) => place.placeType === 'region' || place.placeType === 'mountain',

    );

    if (regionLike) {

      return regionLike;

    }



    return results[0];

  }



  private persistDestination(form: WizardDestinationForm): void {

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

    this.preferencesTouched.set(true);

    const profile = this.preferenceProfile();

    const validationError = validatePreferenceProfile(profile);

    if (validationError) {

      this.store.error.set(validationError);

      return;

    }



    this.store.error.set(null);

    this.store.loading.set(true);

    this.planTripApi

      .updatePreferences(this.store.tripId()!, {

        preferenceProfile: toPreferenceProfilePayload(profile),

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


