import { Component, OnInit, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Slider } from 'primeng/slider';
import { catchError, debounceTime, finalize, map, of, Subject, switchMap } from 'rxjs';

import { PlanTripApiService } from '../../../../core/api/plan-trip-api.service';
import { LanguageService } from '../../../../core/i18n/language.service';
import type {
  InterestSuggestion,
  PlaceResult,
  PreferenceProfile,
  TransportMode,
  TravelPace,
  AccommodationStyle,
  TravelMotivation,
  WizardDestinationForm,
} from '../../../../core/models/plan-trip.models';
import {
  PACE_OPTIONS,
  ACCOMMODATION_OPTIONS,
  MOTIVATION_CHIPS,
  TRANSPORT_PRIMARY_OPTIONS,
  CAR_REFINE_OPTIONS,
  DAILY_BUDGET_MAX_EUR,
  DAILY_BUDGET_MIN_EUR,
  DAILY_BUDGET_STEP_EUR,
  TRAVELER_COUNT_MAX,
  TRAVELER_COUNT_MIN,
  budgetTierHintKey,
  detectCarRefineMode,
  detectTransportPrimary,
  deriveBudgetStyleFromDaily,
  hasCarTransportMode,
  modesFromTransportPrimary,
  toPreferenceProfilePayload,
  validatePreferenceProfile,
  getPreferenceFieldErrors,
  getFirstPreferenceErrorFieldId,
  type PreferenceFieldKey,
  type TransportPrimary,
} from '../../../../core/models/plan-trip.models';
import {
  formatDateLocal,
  getDateFieldErrorKey,
  getDestinationErrorKey,
  getArrivalTimeErrorKey,
  getDepartureTimeErrorKey,
  getSameDayTimeOrderErrorKey,
  normalizeTimeValue,
  minEndDate,
  parseInputDate,
  startOfToday,
  validateDestinationStep,
  getFirstDestinationErrorFieldId,
  type PlanTripDateField,
  type PlanTripTimeField,
} from '../../../../shared/utils/trip-dates.validation';
import { WIZARD_STEPS, DESTINATION_IMAGE_FALLBACK, resolveDestinationPhoto } from '../../data/wizard-destinations';
import { DestinationMapPickerComponent } from '../../components/destination-map-picker/destination-map-picker';
import { PlanTripStore } from '../../services/plan-trip.store';
import { placeTypeLabel } from '../../utils/place-type-label';

@Component({
  selector: 'app-plan-trip-wizard-page',
  imports: [FormsModule, TranslatePipe, DestinationMapPickerComponent, Slider],
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
  protected readonly travelerCount = this.store.travelerCount;
  protected readonly interests = this.store.interests;

  protected readonly loading = this.store.loading;

  protected readonly isGeneratingProposals = computed(() => this.loading() && this.step() === 3);

  protected readonly error = this.store.error;

  protected readonly placeResults = signal<PlaceResult[]>([]);

  protected readonly popularDestinations = signal<PlaceResult[]>([]);

  protected readonly popularDestinationsLoading = signal(true);

  protected readonly destinationImageFallback = DESTINATION_IMAGE_FALLBACK;

  protected readonly resolveDestinationPhoto = resolveDestinationPhoto;

  protected readonly wizardSteps = WIZARD_STEPS;
  protected readonly paceOptions = PACE_OPTIONS;
  protected readonly maxInterests = 5;
  protected readonly interestSuggestions = signal<InterestSuggestion[]>([]);
  protected readonly interestCatalog = signal<InterestSuggestion[]>([]);
  protected readonly interestSearch = signal('');
  protected readonly browseInterestsOpen = signal(false);
  protected readonly interestSuggestionsLoading = signal(false);
  protected readonly interestsTouched = signal(false);
  protected readonly accommodationOptions = ACCOMMODATION_OPTIONS;
  protected readonly motivationChips = MOTIVATION_CHIPS;
  protected readonly transportPrimaryOptions = TRANSPORT_PRIMARY_OPTIONS;
  protected readonly carRefineOptions = CAR_REFINE_OPTIONS;
  protected readonly dailyBudgetMin = DAILY_BUDGET_MIN_EUR;
  protected readonly dailyBudgetMax = DAILY_BUDGET_MAX_EUR;
  protected readonly dailyBudgetStep = DAILY_BUDGET_STEP_EUR;
  protected readonly travelerCountMin = TRAVELER_COUNT_MIN;
  protected readonly travelerCountMax = TRAVELER_COUNT_MAX;
  protected readonly selectedChip = signal<string | null>(null);
  protected readonly mapPickerOpen = signal(false);
  protected readonly additionalRequirementsExpanded = signal(false);
  protected readonly preferencesTouched = signal(false);
  protected readonly interestsLimitError = signal<string | null>(null);

  protected readonly touched = signal({
    destination: false,
    startDate: false,
    endDate: false,
    arrivalTime: false,
    departureTime: false,
  });



  protected readonly hasCarMode = computed(() =>
    hasCarTransportMode(this.preferenceProfile().transportModes),
  );

  protected readonly selectedTransportPrimary = computed(() =>
    detectTransportPrimary(this.preferenceProfile().transportModes),
  );

  protected readonly selectedCarRefineMode = computed(() =>
    detectCarRefineMode(this.preferenceProfile().transportModes),
  );

  protected readonly budgetTierHint = computed(() =>
    budgetTierHintKey(this.preferenceProfile().dailyBudgetPerPersonEur ?? DAILY_BUDGET_MIN_EUR),
  );

  protected readonly preferenceFieldErrors = computed(() =>
    getPreferenceFieldErrors(this.preferenceProfile(), this.travelerCount()),
  );

  protected readonly interestsValidationError = computed(() => {
    if (!this.interestsTouched()) {
      return null;
    }

    if (this.interests().length === 0) {
      return 'planTrip.interests.minRequired';
    }

    return null;
  });

  protected readonly globalError = computed(() => {
    const message = this.error();
    if (!message) {
      return null;
    }

    if (message.startsWith('validation.') || message.startsWith('planTrip.interests.')) {
      return null;
    }

    return message;
  });

  protected readonly destinationHeadline = computed(() => {

    const destination = this.destinationForm().destination.trim();

    if (!destination) {

      return '';

    }

    return destination.split(',')[0]?.trim() ?? destination;

  });

  protected readonly selectedInterestCount = computed(() => this.interests().length);

  protected readonly canSelectMoreInterests = computed(

    () => this.selectedInterestCount() < this.maxInterests,

  );

  protected readonly filteredInterestCatalog = computed(() => {
    const query = this.interestSearch().trim().toLowerCase();
    const catalog = this.interestCatalog();
    if (!query) {
      return catalog;
    }
    return catalog.filter(
      (item) =>
        item.id.toLowerCase().includes(query) ||
        item.labelKey.toLowerCase().includes(query),
    );
  });

  protected readonly recommendedInterests = computed(() => {
    const suggestions = this.interestSuggestions();
    if (suggestions.length > 0) {
      return suggestions.slice(0, 6);
    }
    return this.interestCatalog()
      .filter((item) => item.recommended)
      .slice(0, 6);
  });

  protected readonly selectedInterestItems = computed(() => {
    const catalog = this.interestCatalog();
    const byId = new Map(catalog.map((item) => [item.id, item]));
    return this.interests()
      .map((id) => byId.get(id))
      .filter((item): item is InterestSuggestion => item != null);
  });

  protected readonly isSearchingInterests = computed(() => this.interestSearch().trim().length > 0);

  protected readonly browseInterests = computed(() => {
    const catalog = this.interestCatalog();
    const recommendedIds = new Set(this.recommendedInterests().map((item) => item.id));
    const selectedIds = new Set(this.interests());
    const query = this.interestSearch().trim().toLowerCase();

    if (query) {
      return this.filteredInterestCatalog();
    }

    return catalog.filter((item) => !recommendedIds.has(item.id) || selectedIds.has(item.id));
  });

  protected readonly showBrowsePanel = computed(
    () => this.isSearchingInterests() || this.browseInterestsOpen(),
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

    effect(() => {

      const step = this.step();

      const tripId = this.store.tripId();

      if (step === 3 && tripId) {

        untracked(() => this.loadInterestSuggestions());

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

        switchMap((query) =>
          this.planTripApi.searchPlaces(query).pipe(
            map((results) => ({ query, results })),
            catchError(() => of({ query, results: [] as PlaceResult[] })),
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

  protected shouldShowTimeError(field: PlanTripTimeField): boolean {
    if (!this.touched()[field]) {
      return false;
    }

    const form = this.destinationForm();
    if (field === 'arrivalTime') {
      return !!getArrivalTimeErrorKey(form);
    }

    return !!getDepartureTimeErrorKey(form) || !!getSameDayTimeOrderErrorKey(form);
  }

  protected getTimeErrorKey(field: PlanTripTimeField): string | null {
    const form = this.destinationForm();
    if (field === 'arrivalTime') {
      return getArrivalTimeErrorKey(form);
    }

    return getDepartureTimeErrorKey(form) ?? getSameDayTimeOrderErrorKey(form);
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

  protected shouldShowPreferenceError(field: PreferenceFieldKey): boolean {
    return this.preferencesTouched() && !!this.preferenceFieldErrors()[field];
  }

  protected getPreferenceErrorKey(field: PreferenceFieldKey): string | null {
    return this.preferenceFieldErrors()[field] ?? null;
  }

  protected adjustTravelerCount(delta: number): void {
    this.preferencesTouched.set(true);
    const next = Math.min(
      TRAVELER_COUNT_MAX,
      Math.max(TRAVELER_COUNT_MIN, this.travelerCount() + delta),
    );
    this.travelerCount.set(next);
    this.store.error.set(null);
  }

  protected setDailyBudget(value: number): void {
    this.preferencesTouched.set(true);
    const daily = Math.min(DAILY_BUDGET_MAX_EUR, Math.max(DAILY_BUDGET_MIN_EUR, value));
    this.preferenceProfile.update((profile) => ({
      ...profile,
      dailyBudgetPerPersonEur: daily,
      budgetStyle: deriveBudgetStyleFromDaily(daily),
    }));
    this.store.error.set(null);
  }

  protected setTransportPrimary(primary: TransportPrimary): void {
    this.preferencesTouched.set(true);
    const carMode = detectCarRefineMode(this.preferenceProfile().transportModes);
    this.preferenceProfile.update((profile) => ({
      ...profile,
      transportModes: modesFromTransportPrimary(primary, carMode),
      avoidFlyingWhenTrainReasonable:
        primary === 'FLIGHTS' || primary === 'MIX'
          ? profile.avoidFlyingWhenTrainReasonable
          : false,
    }));
    this.store.error.set(null);
  }

  protected setCarRefineMode(mode: TransportMode): void {
    this.preferencesTouched.set(true);
    this.preferenceProfile.update((profile) => ({
      ...profile,
      transportModes: modesFromTransportPrimary('CAR', mode),
    }));
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
      paceIntensity: null,
    }));
    this.store.error.set(null);
  }

  protected setAccommodationStyle(style: AccommodationStyle): void {
    this.preferencesTouched.set(true);
    this.preferenceProfile.update((profile) => ({ ...profile, accommodationStyle: style }));
    this.store.error.set(null);
  }

  protected toggleMotivation(motivation: TravelMotivation): void {
    this.preferenceProfile.update((profile) => {
      const current = profile.motivationHints ?? [];
      const next = current.includes(motivation)
        ? current.filter((m) => m !== motivation)
        : [...current, motivation];
      return { ...profile, motivationHints: next };
    });
  }

  protected isMotivationSelected(motivation: TravelMotivation): boolean {
    return (this.preferenceProfile().motivationHints ?? []).includes(motivation);
  }

  protected onInterestSearch(value: string): void {
    this.interestSearch.set(value);
    if (value.trim()) {
      this.browseInterestsOpen.set(true);
    }
  }

  protected toggleBrowseInterests(): void {
    this.browseInterestsOpen.update((open) => !open);
  }

  protected clearInterestSearch(): void {
    this.interestSearch.set('');
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
    this.destinationForm.update((f) => ({ ...f, destination: value, placeType: null, lat: 0, lng: 0 }));
    this.selectedChip.set(null);
    this.store.error.set(null);

    if (value.length >= 2) {
      this.searchQuery$.next(value);
    } else {
      this.placeResults.set([]);
    }
  }

  protected onArrivalTimeInput(value: string): void {
    this.touched.update((state) => ({ ...state, arrivalTime: true }));
    this.destinationForm.update((f) => ({ ...f, arrivalTime: normalizeTimeValue(value) }));
    this.store.error.set(null);
  }

  protected onDepartureTimeInput(value: string): void {
    this.touched.update((state) => ({ ...state, departureTime: true }));
    this.destinationForm.update((f) => ({ ...f, departureTime: normalizeTimeValue(value) }));
    this.store.error.set(null);
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

      placeType: place.placeType,

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

      .getPopularDestinations(4)

      .pipe(

        catchError(() => of([])),

        finalize(() => this.popularDestinationsLoading.set(false)),

      )

      .subscribe((destinations) => this.popularDestinations.set(destinations));

  }



  protected continueFromDestination(): void {
    this.touched.set({
      destination: true,
      startDate: true,
      endDate: true,
      arrivalTime: true,
      departureTime: true,
    });

    this.tryAutoSelectSuggestion();

    const form = this.destinationForm();
    const destinationQuery = form.destination.trim();
    const missingDestinationCoords = form.lat === 0 && form.lng === 0;

    if (missingDestinationCoords && destinationQuery.length >= 2) {
      this.store.loading.set(true);
      this.store.error.set(null);

      this.planTripApi
        .searchPlaces(destinationQuery)
        .pipe(finalize(() => this.store.loading.set(false)))
        .subscribe((destinationResults) => {
          if (destinationResults.length) {
            this.placeResults.set(destinationResults);
            const match = this.pickBestPlaceMatch(destinationQuery, destinationResults);
            if (match) {
              this.selectPlace(match);
            }
          }
          this.persistDestination(this.destinationForm());
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
      this.scrollToField(getFirstDestinationErrorFieldId(form));
      return;
    }



    this.store.error.set(null);

    this.store.loading.set(true);

    const tripId = this.store.tripId()!;



    this.planTripApi

      .updateDestination(tripId, {
        destination: form.destination,
        placeType: form.placeType,
        lat: form.lat,
        lng: form.lng,
        startDate: formatDateLocal(form.startDate!),
        endDate: formatDateLocal(form.endDate!),
        arrivalTime: form.arrivalTime,
        departureTime: form.departureTime,
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
    const validationError = validatePreferenceProfile(profile, this.travelerCount());
    if (validationError) {
      this.scrollToField(getFirstPreferenceErrorFieldId(profile, this.travelerCount()));
      return;
    }

    this.store.error.set(null);
    this.store.loading.set(true);
    this.planTripApi
      .updatePreferences(this.store.tripId()!, {
        preferenceProfile: toPreferenceProfilePayload(profile),
        travelerCount: this.travelerCount(),
      })
      .pipe(finalize(() => this.store.loading.set(false)))
      .subscribe({
        next: () => {
          this.interests.set([]);
          this.interestsTouched.set(false);
          this.store.wizardStep.set(3);
        },
        error: () => this.store.error.set('Failed to save preferences.'),
      });
  }



  private loadInterestSuggestions(): void {

    const tripId = this.store.tripId();

    if (!tripId || this.interestSuggestionsLoading()) {

      return;

    }



    this.interestSuggestionsLoading.set(true);

    this.store.error.set(null);



    this.planTripApi

      .getInterestSuggestions(tripId)

      .pipe(

        catchError(() => {

          this.store.error.set('planTrip.interests.loadFailed');

          return of([]);

        }),

        finalize(() => this.interestSuggestionsLoading.set(false)),

      )

      .subscribe((suggestions) => {

        this.interestSuggestions.set(suggestions);

        if (this.interests().length === 0) {

          const recommended = suggestions

            .filter((suggestion) => suggestion.recommended)

            .slice(0, 2)

            .map((suggestion) => suggestion.id);

          this.interests.set(recommended);

        }

      });



    this.planTripApi.getInterestCatalog(tripId).pipe(catchError(() => of([]))).subscribe((catalog) => {

      this.interestCatalog.set(catalog);

    });

  }



  protected isInterestSelected(interestId: string): boolean {

    return this.interests().includes(interestId);

  }



  protected isInterestDisabled(interestId: string): boolean {

    return !this.isInterestSelected(interestId) && !this.canSelectMoreInterests();

  }



  protected toggleInterest(interestId: string): void {

    this.interestsTouched.set(true);
    this.interestsLimitError.set(null);

    const current = this.interests();

    if (current.includes(interestId)) {

      this.interests.set(current.filter((id) => id !== interestId));
      this.interestsLimitError.set(null);

      return;

    }

    if (current.length >= this.maxInterests) {

      this.interestsLimitError.set('planTrip.interests.maxReached');

      return;

    }

    this.interests.set([...current, interestId]);
    this.interestsLimitError.set(null);

  }



  protected generateProposals(): void {

    this.interestsTouched.set(true);
    this.interestsLimitError.set(null);

    const selected = this.interests();

    if (selected.length === 0) {
      this.scrollToField('interests-selection');
      return;
    }

    if (selected.length > this.maxInterests) {
      this.interestsLimitError.set('planTrip.interests.maxReached');
      this.scrollToField('interests-selection');
      return;
    }



    this.store.loading.set(true);

    this.store.error.set(null);

    const tripId = this.store.tripId()!;

    const profile = toPreferenceProfilePayload(this.preferenceProfile());



    this.planTripApi

      .updatePreferences(tripId, {
        preferenceProfile: profile,
        travelerCount: this.travelerCount(),
      })

      .pipe(

        switchMap(() => this.planTripApi.updateInterests(tripId, selected)),

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

  private scrollToField(fieldId: string | null): void {
    if (!fieldId) {
      return;
    }

    queueMicrotask(() => {
      document.getElementById(fieldId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

}


