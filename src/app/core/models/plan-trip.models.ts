export type BudgetTier = 'ECO' | 'MID_RANGE' | 'PREMIUM';
export type TravelPace = 'RELAXED' | 'BALANCED' | 'ACTIVE';
export type ProposalType = 'RELAXED' | 'BALANCED' | 'INTENSE';
export type ActivityType = 'ACTIVITY' | 'FOOD' | 'TRANSPORT' | 'ACCOMMODATION';

export interface PlaceResult {
  name: string;
  region: string | null;
  country: string;
  countryCode: string | null;
  displayName: string;
  photoUrl: string | null;
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

export type InterestOption = {
  label: string;
  icon: string;
};

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
  label: string;
  description: string;
  range: string;
  icon: string;
}> = [
  {
    tier: 'ECO',
    label: 'Eco',
    description: 'Budget-friendly travel',
    range: '$50-100/day',
    icon: '💰',
  },
  {
    tier: 'MID_RANGE',
    label: 'Mid-Range',
    description: 'Comfortable & balanced',
    range: '$100-250/day',
    icon: '💎',
  },
  {
    tier: 'PREMIUM',
    label: 'Premium',
    description: 'Luxury experiences',
    range: '$250+/day',
    icon: '👑',
  },
];

export const PACE_OPTIONS: Array<{
  pace: TravelPace;
  label: string;
  detail: string;
  icon: string;
}> = [
  { pace: 'RELAXED', label: 'Relaxed', detail: '2-3 activities per day', icon: '🧘' },
  { pace: 'BALANCED', label: 'Balanced', detail: '4-5 activities per day', icon: '⚖️' },
  { pace: 'ACTIVE', label: 'Active', detail: '6+ activities per day', icon: '🏃' },
];
