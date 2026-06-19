export type BudgetTier = 'ECO' | 'MID_RANGE' | 'PREMIUM';
export type TravelPace = 'RELAXED' | 'BALANCED' | 'ACTIVE';
export type ProposalType = 'RELAXED' | 'BALANCED' | 'INTENSE';
export type ActivityType = 'ACTIVITY' | 'FOOD' | 'TRANSPORT' | 'ACCOMMODATION';

export interface PlaceResult {
  name: string;
  country: string;
  displayName: string;
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

export const INTEREST_OPTIONS = [
  'Child-friendly',
  'Restaurants',
  'Nature',
  'Photography spots',
  'Adventure',
  'Culture & History',
  'Nightlife',
  'Beaches',
] as const;

export const BUDGET_OPTIONS: Array<{ tier: BudgetTier; label: string; range: string }> = [
  { tier: 'ECO', label: 'Eco', range: '$50-100/day' },
  { tier: 'MID_RANGE', label: 'Mid-Range', range: '$100-250/day' },
  { tier: 'PREMIUM', label: 'Premium', range: '$250+/day' },
];

export const PACE_OPTIONS: Array<{ pace: TravelPace; label: string; detail: string }> = [
  { pace: 'RELAXED', label: 'Relaxed', detail: '2-3 activities per day' },
  { pace: 'BALANCED', label: 'Balanced', detail: '4-5 activities per day' },
  { pace: 'ACTIVE', label: 'Active', detail: '6+ activities per day' },
];
