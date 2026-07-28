export type BudgetTier = 'ECO' | 'MID_RANGE' | 'PREMIUM';

export type TravelPace = 'RELAXED' | 'BALANCED' | 'ACTIVE';

export type ProposalType = 'RELAXED' | 'BALANCED' | 'INTENSE';

export type ActivityType = 'ACTIVITY' | 'FOOD' | 'TRANSPORT' | 'ACCOMMODATION';

export type SpendingPriority = 'SAVE' | 'BALANCED' | 'INVEST';

export type PreferenceCategory = 'ACCOMMODATION' | 'FOOD' | 'ATTRACTIONS' | 'TRANSPORT';

export type TransportMode =

  | 'PUBLIC_TRANSIT'

  | 'TRAINS'

  | 'FLIGHTS'

  | 'OWN_CAR'

  | 'BUDGET_CAR_RENTAL'

  | 'PREMIUM_CAR_RENTAL'

  | 'WALK_CYCLE';

export type PaceIntensity = 'EASY' | 'MODERATE' | 'AMBITIOUS';

export type AccommodationStyle = 'HOTEL' | 'APARTMENT' | 'HOSTEL' | 'RESORT' | 'CAMPING' | 'TENT' | 'MIXED';

export type TravelerParty = 'SOLO' | 'COUPLE' | 'FAMILY' | 'FRIENDS' | 'GROUP';

export type FoodStyle = 'STREET_FOOD' | 'FINE_DINING' | 'LOCAL_HOME' | 'FLEXIBLE';

export type EveningPreference = 'EARLY_REST' | 'EXPLORING' | 'NIGHTLIFE';

export type TripFormatHint = 'AUTO' | 'SINGLE_BASE' | 'MULTI_CITY' | 'ROAD_TRIP' | 'RESORT_STAY' | 'EXPEDITION';

export type TravelMotivation =
  | 'SUN_RELAX'
  | 'CULTURE_DISCOVERY'
  | 'NATURE_ADVENTURE'
  | 'FOOD_CULINARY'
  | 'URBAN_LIFESTYLE'
  | 'WELLNESS_RESET'
  | 'SCENIC_JOURNEY'
  | 'WATER_PLAY'
  | 'WILDLIFE_ECO'
  | 'SOCIAL_CELEBRATION'
  | 'VALUE_SIMPLICITY'
  | 'PREMIUM_INDULGENCE'
  | 'MIXED';

export type DayRole =
  | 'ARRIVAL'
  | 'DEPARTURE'
  | 'MOVE'
  | 'EXPLORE'
  | 'EXCURSION'
  | 'RELAX'
  | 'RECOVERY'
  | 'FLEX'
  | 'EVENT_ANCHOR';

export type ActivityDomain =
  | 'MOUNTAIN_SUMMIT'
  | 'MOUNTAIN_TRAIL'
  | 'VIA_FERRATA_CLIMB'
  | 'CITY_WALKING'
  | 'MUSEUM_GALLERY'
  | 'FOOD_DINING'
  | 'BEACH_LEISURE'
  | 'SPA_WELLNESS'
  | 'SCENIC_DRIVE'
  | 'NIGHTLIFE_ENTERTAINMENT'
  | 'UNSTRUCTURED'
  | string;

export type SlotKind = 'TIP' | 'CORE' | 'OPTIONAL' | 'REST' | 'CONTINGENCY';

export type TimeFlexibility = 'FIXED' | 'FLEXIBLE' | 'WINDOW';

export type ExpandAction =
  | 'EVENING_NEIGHBORHOOD_WALK'
  | 'NIGHTLIFE_OPTIONS'
  | 'RECOVERY_SPA'
  | 'FAMILY_ACTIVITY'
  | 'FOOD_CRAWL'
  | 'WEATHER_PLAN_B'
  | 'PHOTO_GOLDEN_HOUR'
  | 'LOCAL_EXPERIENCE';

export type VisitStyle = 'SELF_GUIDED' | 'GUIDED' | 'RESERVATION' | 'WALK_IN';

export type PhotoConfidence = 'HIGH' | 'LOW' | 'NONE';

export type ExternalLinkType = 'ALLTRAILS' | 'WIKILOC' | 'ARTICLE' | 'MAPS' | 'OTHER';

export interface RouteWaypoint {
  name: string;
  lat?: number | null;
  lng?: number | null;
}

export interface ItineraryExternalLink {
  type: ExternalLinkType;
  url: string;
  label: string;
}



export interface PreferenceProfile {

  budgetStyle: BudgetTier | null;

  dailyBudgetPerPersonEur: number | null;

  categoryPriorities: Record<PreferenceCategory, SpendingPriority>;

  transportModes: TransportMode[];

  avoidFlyingWhenTrainReasonable: boolean;

  pace: TravelPace | null;

  paceIntensity: PaceIntensity | null;

  additionalRequirements: string | null;

  accommodationStyle?: AccommodationStyle | null;

  travelerParty?: TravelerParty | null;

  foodStyle?: FoodStyle | null;

  eveningPreference?: EveningPreference | null;

  tripFormatHint?: TripFormatHint | null;

  motivationHints?: TravelMotivation[];
}



export interface CostRange {

  min: number;

  max: number;

}



export interface TransportSubCost {

  publicTransit?: CostRange | null;

  fuel?: CostRange | null;

  parking?: CostRange | null;

  carRental?: CostRange | null;

}



export interface TransportCostBreakdown extends CostRange {

  includesCarCosts?: boolean;

  sub?: TransportSubCost | null;

}



export interface ProposalCostBreakdown {

  estimatedTotal: {

    min: number;

    max: number;

    currency: string;

    confidence: string;

  };

  breakdown: {

    accommodation: CostRange;

    transport: TransportCostBreakdown;

    food: CostRange;

    attractions: CostRange;

  };

}



export interface PlaceResult {

  name: string;

  region: string | null;

  country: string;

  countryCode: string | null;

  displayName: string;

  photoUrl: string | null;

  placeType: string | null;

  lat: number;

  lng: number;

}



export interface WeatherDay {

  dayLabel: string;

  icon: string;

  tempC: number;

}



export interface TripProposal {

  id: number;

  type: ProposalType;

  title: string;

  summary: string;

  estimatedCostUsd: number;

  recommended: boolean;

  costBreakdown?: ProposalCostBreakdown | null;

  weatherForecast: WeatherDay[];

  highlights: string[];

  primaryMotivation?: string | null;

  tripFormat?: string | null;

}



export interface ItineraryActivity {

  id: number;

  startTime: string;

  endTime?: string | null;

  type: ActivityType;

  slotKind?: SlotKind | null;

  timeFlexibility?: TimeFlexibility | null;

  title: string;

  description: string;

  why?: string | null;

  tips?: string[];

  optional?: boolean;

  expandAction?: ExpandAction | null;

  placeName: string | null;

  lat: number | null;

  lng: number | null;

  tempC: number | null;

  placeId?: string | null;

  rating?: number | null;

  priceLevel?: number | null;

  mapsUrl?: string | null;

  photoUrl?: string | null;

  sources?: string[];

  activityDomain?: ActivityDomain | null;

  formattedAddress?: string | null;

  visitStyle?: VisitStyle | null;

  routeSummary?: string | null;

  routeWaypoints?: RouteWaypoint[];

  costLabel?: string | null;

  costMin?: number | null;

  costMax?: number | null;

  optionalAddons?: string | null;

  externalLinks?: ItineraryExternalLink[];

  photoConfidence?: PhotoConfidence | null;

}



export interface ItineraryDaySummary {

  dayNumber: number;

  date: string;

  dayRole?: DayRole | null;

  activityDomain?: ActivityDomain | null;

  themeKeywords?: string | null;

  daySummary?: string | null;

  dailyCostMin?: number | null;

  dailyCostMax?: number | null;

  dailyDistanceLabel?: string | null;

}



export interface TripItinerary {

  tripId: number;

  title: string;

  destination: string;

  selectedProposalType: ProposalType | null;

  totalDays: number;

  days: ItineraryDaySummary[];

  activities: ItineraryActivity[];

  selectedDayRole?: DayRole | null;

  selectedActivityDomain?: ActivityDomain | null;

}



export interface WizardDestinationForm {
  destination: string;
  placeType: string | null;
  lat: number;
  lng: number;
  startDate: Date | null;
  endDate: Date | null;
  arrivalTime: string;
  departureTime: string;
}

export const DEFAULT_ARRIVAL_TIME = '14:00';
export const DEFAULT_DEPARTURE_TIME = '11:00';



export interface InterestSuggestion {

  id: string;

  labelKey: string;

  icon: string;

  recommended: boolean;

  reasonKey?: string | null;

}



export type InterestOption = InterestSuggestion;



export const PREFERENCE_CATEGORIES: PreferenceCategory[] = [

  'ACCOMMODATION',

  'FOOD',

  'ATTRACTIONS',

  'TRANSPORT',

];



export const SPENDING_PRIORITIES: SpendingPriority[] = ['SAVE', 'BALANCED', 'INVEST'];



export const TRANSPORT_MODES: TransportMode[] = [

  'PUBLIC_TRANSIT',

  'TRAINS',

  'FLIGHTS',

  'OWN_CAR',

  'BUDGET_CAR_RENTAL',

  'PREMIUM_CAR_RENTAL',

  'WALK_CYCLE',

];



export const CAR_TRANSPORT_MODES: TransportMode[] = ['OWN_CAR', 'BUDGET_CAR_RENTAL', 'PREMIUM_CAR_RENTAL'];

export const DAILY_BUDGET_MIN_EUR = 30;
export const DAILY_BUDGET_MAX_EUR = 500;
export const DAILY_BUDGET_DEFAULT_EUR = 120;
export const DAILY_BUDGET_STEP_EUR = 5;
export const TRAVELER_COUNT_MIN = 1;
export const TRAVELER_COUNT_MAX = 12;

export type TransportPrimary = 'PUBLIC' | 'CAR' | 'TRAINS' | 'FLIGHTS' | 'MIX';

export const TRANSPORT_PRIMARY_OPTIONS: Array<{
  id: TransportPrimary;
  labelKey: string;
  descriptionKey: string;
  icon: string;
}> = [
  {
    id: 'PUBLIC',
    labelKey: 'planTrip.preferences.transport.primary.public.label',
    descriptionKey: 'planTrip.preferences.transport.primary.public.description',
    icon: 'pi-directions',
  },
  {
    id: 'CAR',
    labelKey: 'planTrip.preferences.transport.primary.car.label',
    descriptionKey: 'planTrip.preferences.transport.primary.car.description',
    icon: 'pi-car',
  },
  {
    id: 'TRAINS',
    labelKey: 'planTrip.preferences.transport.primary.trains.label',
    descriptionKey: 'planTrip.preferences.transport.primary.trains.description',
    icon: 'pi-sitemap',
  },
  {
    id: 'FLIGHTS',
    labelKey: 'planTrip.preferences.transport.primary.flights.label',
    descriptionKey: 'planTrip.preferences.transport.primary.flights.description',
    icon: 'pi-send',
  },
  {
    id: 'MIX',
    labelKey: 'planTrip.preferences.transport.primary.mix.label',
    descriptionKey: 'planTrip.preferences.transport.primary.mix.description',
    icon: 'pi-globe',
  },
];

export const CAR_REFINE_OPTIONS: Array<{ mode: TransportMode; labelKey: string }> = [
  { mode: 'OWN_CAR', labelKey: 'planTrip.preferences.transport.carRefine.own' },
  { mode: 'BUDGET_CAR_RENTAL', labelKey: 'planTrip.preferences.transport.carRefine.budget' },
  { mode: 'PREMIUM_CAR_RENTAL', labelKey: 'planTrip.preferences.transport.carRefine.premium' },
];

export function deriveBudgetStyleFromDaily(dailyBudgetPerPersonEur: number): BudgetTier {
  if (dailyBudgetPerPersonEur < 100) {
    return 'ECO';
  }
  if (dailyBudgetPerPersonEur < 200) {
    return 'MID_RANGE';
  }
  return 'PREMIUM';
}

export function budgetTierHintKey(dailyBudgetPerPersonEur: number): string {
  const tier = deriveBudgetStyleFromDaily(dailyBudgetPerPersonEur);
  if (tier === 'ECO') {
    return 'planTrip.preferences.budget.hint.eco';
  }
  if (tier === 'MID_RANGE') {
    return 'planTrip.preferences.budget.hint.midRange';
  }
  return 'planTrip.preferences.budget.hint.premium';
}

export function modesFromTransportPrimary(
  primary: TransportPrimary,
  carMode: TransportMode = 'OWN_CAR',
): TransportMode[] {
  switch (primary) {
    case 'PUBLIC':
      return ['PUBLIC_TRANSIT', 'WALK_CYCLE'];
    case 'CAR':
      return [CAR_TRANSPORT_MODES.includes(carMode) ? carMode : 'OWN_CAR'];
    case 'TRAINS':
      return ['TRAINS', 'PUBLIC_TRANSIT'];
    case 'FLIGHTS':
      return ['FLIGHTS', 'PUBLIC_TRANSIT'];
    case 'MIX':
      return ['PUBLIC_TRANSIT', 'TRAINS', 'FLIGHTS'];
  }
}

export function detectTransportPrimary(modes: TransportMode[]): TransportPrimary | null {
  if (!modes.length) {
    return null;
  }
  const unique = new Set(modes);
  const onlyCar = [...unique].every((mode) => CAR_TRANSPORT_MODES.includes(mode));
  if (onlyCar) {
    return 'CAR';
  }
  if (unique.has('FLIGHTS') && unique.has('TRAINS') && unique.has('PUBLIC_TRANSIT')) {
    return 'MIX';
  }
  if (unique.has('FLIGHTS') && !unique.has('TRAINS')) {
    return 'FLIGHTS';
  }
  if (unique.has('TRAINS') && !unique.has('FLIGHTS')) {
    return 'TRAINS';
  }
  if (unique.has('PUBLIC_TRANSIT') || unique.has('WALK_CYCLE')) {
    return 'PUBLIC';
  }
  return 'MIX';
}

export function detectCarRefineMode(modes: TransportMode[]): TransportMode {
  const carMode = modes.find((mode) => CAR_TRANSPORT_MODES.includes(mode));
  return carMode ?? 'OWN_CAR';
}

export function createDefaultCategoryPriorities(): Record<PreferenceCategory, SpendingPriority> {

  return {

    ACCOMMODATION: 'BALANCED',

    FOOD: 'BALANCED',

    ATTRACTIONS: 'BALANCED',

    TRANSPORT: 'BALANCED',

  };

}



export function createDefaultPreferenceProfile(): PreferenceProfile {

  return {

    budgetStyle: deriveBudgetStyleFromDaily(DAILY_BUDGET_DEFAULT_EUR),

    dailyBudgetPerPersonEur: DAILY_BUDGET_DEFAULT_EUR,

    categoryPriorities: createDefaultCategoryPriorities(),

    transportModes: [],

    avoidFlyingWhenTrainReasonable: false,

    pace: null,

    paceIntensity: null,

    additionalRequirements: null,

    accommodationStyle: null,

    travelerParty: null,

    foodStyle: null,

    eveningPreference: null,

    tripFormatHint: 'AUTO',

    motivationHints: [],

  };

}



export function hasCarTransportMode(modes: TransportMode[]): boolean {

  return modes.some((mode) => CAR_TRANSPORT_MODES.includes(mode));

}



export function sanitizeAdditionalRequirements(value: string | null | undefined): string | null {

  if (value == null) {

    return null;

  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed.slice(0, 500) : null;

}



export type PreferenceFieldKey = 'travelers' | 'budget' | 'pace' | 'transport';

const PREFERENCE_FIELD_ORDER: PreferenceFieldKey[] = ['travelers', 'budget', 'pace', 'transport'];

export function getPreferenceFieldErrors(
  profile: PreferenceProfile,
  travelerCount: number,
): Partial<Record<PreferenceFieldKey, string>> {
  const errors: Partial<Record<PreferenceFieldKey, string>> = {};

  if (
    travelerCount < TRAVELER_COUNT_MIN ||
    travelerCount > TRAVELER_COUNT_MAX ||
    !Number.isInteger(travelerCount)
  ) {
    errors.travelers = 'validation.planTrip.preferences.travelersRequired';
  }

  const daily = profile.dailyBudgetPerPersonEur;
  if (
    daily == null ||
    daily < DAILY_BUDGET_MIN_EUR ||
    daily > DAILY_BUDGET_MAX_EUR
  ) {
    errors.budget = 'validation.planTrip.preferences.budgetRequired';
  }

  if (!profile.pace) {
    errors.pace = 'validation.planTrip.preferences.paceRequired';
  }

  if (profile.transportModes.length === 0 || !detectTransportPrimary(profile.transportModes)) {
    errors.transport = 'validation.planTrip.preferences.transportRequired';
  }

  return errors;
}

export function getFirstPreferenceErrorFieldId(
  profile: PreferenceProfile,
  travelerCount: number,
): string | null {
  const errors = getPreferenceFieldErrors(profile, travelerCount);
  const first = PREFERENCE_FIELD_ORDER.find((field) => errors[field]);
  return first ? `preference-${first}` : null;
}

export function validatePreferenceProfile(
  profile: PreferenceProfile,
  travelerCount: number,
): string | null {
  const errors = getPreferenceFieldErrors(profile, travelerCount);
  const first = PREFERENCE_FIELD_ORDER.find((field) => errors[field]);
  return first ? errors[first]! : null;
}



export function toPreferenceProfilePayload(profile: PreferenceProfile): PreferenceProfile {
  const daily = profile.dailyBudgetPerPersonEur ?? DAILY_BUDGET_DEFAULT_EUR;
  return {
    budgetStyle: deriveBudgetStyleFromDaily(daily),
    dailyBudgetPerPersonEur: daily,
    categoryPriorities: createDefaultCategoryPriorities(),
    transportModes: [...profile.transportModes],
    avoidFlyingWhenTrainReasonable: profile.avoidFlyingWhenTrainReasonable,
    pace: profile.pace!,
    paceIntensity: null,
    additionalRequirements: sanitizeAdditionalRequirements(profile.additionalRequirements),
    accommodationStyle: profile.accommodationStyle ?? null,
    travelerParty: null,
    foodStyle: profile.foodStyle ?? null,
    eveningPreference: profile.eveningPreference ?? null,
    tripFormatHint: profile.tripFormatHint ?? 'AUTO',
    motivationHints: profile.motivationHints ?? [],
  };
}

export const BUDGET_OPTIONS: Array<{

  tier: BudgetTier;

  labelKey: string;

  descriptionKey: string;

  icon: string;

}> = [

  {

    tier: 'ECO',

    labelKey: 'planTrip.preferences.budget.eco.label',

    descriptionKey: 'planTrip.preferences.budget.eco.description',

    icon: '💰',

  },

  {

    tier: 'MID_RANGE',

    labelKey: 'planTrip.preferences.budget.midRange.label',

    descriptionKey: 'planTrip.preferences.budget.midRange.description',

    icon: '💎',

  },

  {

    tier: 'PREMIUM',

    labelKey: 'planTrip.preferences.budget.premium.label',

    descriptionKey: 'planTrip.preferences.budget.premium.description',

    icon: '👑',

  },

];



export const PACE_OPTIONS: Array<{

  pace: TravelPace;

  labelKey: string;

  detailKey: string;

  icon: string;

}> = [

  {

    pace: 'RELAXED',

    labelKey: 'planTrip.preferences.pace.relaxed.label',

    detailKey: 'planTrip.preferences.pace.relaxed.detail',

    icon: '🧘',

  },

  {

    pace: 'BALANCED',

    labelKey: 'planTrip.preferences.pace.balanced.label',

    detailKey: 'planTrip.preferences.pace.balanced.detail',

    icon: '⚖️',

  },

  {

    pace: 'ACTIVE',

    labelKey: 'planTrip.preferences.pace.active.label',

    detailKey: 'planTrip.preferences.pace.active.detail',

    icon: '🏃',

  },

];



export const ACCOMMODATION_OPTIONS: Array<{
  style: AccommodationStyle;
  labelKey: string;
  descriptionKey: string;
  icon: string;
}> = [
  {
    style: 'HOTEL',
    labelKey: 'planTrip.preferences.accommodation.hotel',
    descriptionKey: 'planTrip.preferences.accommodation.hotelDesc',
    icon: 'pi-building',
  },
  {
    style: 'APARTMENT',
    labelKey: 'planTrip.preferences.accommodation.apartment',
    descriptionKey: 'planTrip.preferences.accommodation.apartmentDesc',
    icon: 'pi-home',
  },
  {
    style: 'HOSTEL',
    labelKey: 'planTrip.preferences.accommodation.hostel',
    descriptionKey: 'planTrip.preferences.accommodation.hostelDesc',
    icon: 'pi-users',
  },
  {
    style: 'RESORT',
    labelKey: 'planTrip.preferences.accommodation.resort',
    descriptionKey: 'planTrip.preferences.accommodation.resortDesc',
    icon: 'pi-sun',
  },
  {
    style: 'CAMPING',
    labelKey: 'planTrip.preferences.accommodation.camping',
    descriptionKey: 'planTrip.preferences.accommodation.campingDesc',
    icon: 'pi-map',
  },
  {
    style: 'MIXED',
    labelKey: 'planTrip.preferences.accommodation.mixed',
    descriptionKey: 'planTrip.preferences.accommodation.mixedDesc',
    icon: 'pi-th-large',
  },
];



export const PARTY_OPTIONS: Array<{ party: TravelerParty; labelKey: string }> = [
  { party: 'SOLO', labelKey: 'planTrip.preferences.party.solo' },
  { party: 'COUPLE', labelKey: 'planTrip.preferences.party.couple' },
  { party: 'FAMILY', labelKey: 'planTrip.preferences.party.family' },
  { party: 'FRIENDS', labelKey: 'planTrip.preferences.party.friends' },
  { party: 'GROUP', labelKey: 'planTrip.preferences.party.group' },
];



export const MOTIVATION_CHIPS: Array<{ motivation: TravelMotivation; labelKey: string }> = [
  { motivation: 'SUN_RELAX', labelKey: 'planTrip.interests.motivations.relax' },
  { motivation: 'NATURE_ADVENTURE', labelKey: 'planTrip.interests.motivations.adventure' },
  { motivation: 'CULTURE_DISCOVERY', labelKey: 'planTrip.interests.motivations.culture' },
  { motivation: 'FOOD_CULINARY', labelKey: 'planTrip.interests.motivations.food' },
  { motivation: 'URBAN_LIFESTYLE', labelKey: 'planTrip.interests.motivations.nightlife' },
];
