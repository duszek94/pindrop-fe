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



export interface PreferenceProfile {

  budgetStyle: BudgetTier | null;

  categoryPriorities: Record<PreferenceCategory, SpendingPriority>;

  transportModes: TransportMode[];

  avoidFlyingWhenTrainReasonable: boolean;

  pace: TravelPace | null;

  paceIntensity: PaceIntensity | null;

  additionalRequirements: string | null;

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

}



export interface ItineraryActivity {

  id: number;

  startTime: string;

  type: ActivityType;

  title: string;

  description: string;

  placeName: string | null;

  lat: number | null;

  lng: number | null;

  tempC: number | null;

}



export interface ItineraryDaySummary {

  dayNumber: number;

  date: string;

}



export interface TripItinerary {

  tripId: number;

  title: string;

  destination: string;

  selectedProposalType: ProposalType | null;

  totalDays: number;

  days: ItineraryDaySummary[];

  activities: ItineraryActivity[];

}



export interface WizardDestinationForm {

  destination: string;

  lat: number;

  lng: number;

  startDate: Date | null;

  endDate: Date | null;

}



export type InterestOption = {

  label: string;

  icon: string;

};



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



export const PACE_INTENSITIES: PaceIntensity[] = ['EASY', 'MODERATE', 'AMBITIOUS'];



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

    budgetStyle: null,

    categoryPriorities: createDefaultCategoryPriorities(),

    transportModes: [],

    avoidFlyingWhenTrainReasonable: false,

    pace: null,

    paceIntensity: null,

    additionalRequirements: null,

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



export function validatePreferenceProfile(profile: PreferenceProfile): string | null {

  if (!profile.budgetStyle) {

    return 'validation.planTrip.preferences.budgetRequired';

  }

  if (!profile.pace) {

    return 'validation.planTrip.preferences.paceRequired';

  }

  if (profile.transportModes.length === 0) {

    return 'validation.planTrip.preferences.transportRequired';

  }

  for (const category of PREFERENCE_CATEGORIES) {

    if (!profile.categoryPriorities[category]) {

      return 'validation.planTrip.preferences.categoryRequired';

    }

  }

  return null;

}



export function toPreferenceProfilePayload(profile: PreferenceProfile): PreferenceProfile {

  return {

    budgetStyle: profile.budgetStyle!,

    categoryPriorities: { ...profile.categoryPriorities },

    transportModes: [...profile.transportModes],

    avoidFlyingWhenTrainReasonable: profile.avoidFlyingWhenTrainReasonable,

    pace: profile.pace!,

    paceIntensity: profile.pace === 'ACTIVE' ? profile.paceIntensity : null,

    additionalRequirements: sanitizeAdditionalRequirements(profile.additionalRequirements),

  };

}



export const INTEREST_OPTIONS: InterestOption[] = [

  { label: 'Child-friendly', icon: 'pi-users' },

  { label: 'Restaurants', icon: 'pi-shop' },

  { label: 'Nature', icon: 'pi-sun' },

  { label: 'Photography spots', icon: 'pi-camera' },

  { label: 'Adventure', icon: 'pi-compass' },

  { label: 'Culture & History', icon: 'pi-building' },

  { label: 'Nightlife', icon: 'pi-moon' },

  { label: 'Beaches', icon: 'pi-globe' },

];



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


