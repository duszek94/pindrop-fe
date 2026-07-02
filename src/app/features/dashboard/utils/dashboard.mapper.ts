import type {
  ItineraryResponse,
  TripResponse,
  TripStatusApi,
} from '../../../core/models/dashboard-api.models';
import type { FavoriteItinerary, Trip, TripStatus } from '../../../core/models/dashboard.models';
import { isLikelyMapImage } from '../../plan-trip/data/wizard-destinations';

const TRIP_ICONS: Array<{ icon: string; iconTone: Trip['iconTone'] }> = [
  { icon: 'pi-building', iconTone: 'rose' },
  { icon: 'pi-star', iconTone: 'amber' },
  { icon: 'pi-sun', iconTone: 'emerald' },
  { icon: 'pi-compass', iconTone: 'sky' },
];

const ITINERARY_TONES: FavoriteItinerary['iconTone'][] = ['emerald', 'indigo', 'sky'];

const STATUS_MAP: Record<TripStatusApi, TripStatus> = {
  PLANNING: 'planning',
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const DATE_FORMAT: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate) {
    return '';
  }

  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) {
    return '';
  }

  if (!endDate) {
    return start.toLocaleDateString('en-US', DATE_FORMAT);
  }

  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) {
    return start.toLocaleDateString('en-US', DATE_FORMAT);
  }

  return `${start.toLocaleDateString('en-US', DATE_FORMAT)} - ${end.toLocaleDateString('en-US', DATE_FORMAT)}`;
}

function formatDuration(durationDays: number | null): string {
  if (durationDays == null || durationDays <= 0) {
    return '';
  }

  return durationDays === 1 ? '1 day' : `${durationDays} days`;
}

function initialsFromTitle(title: string): string {
  const words = title.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return title.slice(0, 2).toUpperCase();
}

function isUsableImageUrl(url: string | null | undefined): url is string {
  if (!url) {
    return false;
  }

  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/assets/');
}

function resolveTripCoverImage(trip: TripResponse): string | null {
  if (isUsableImageUrl(trip.coverImageUrl) && !isLikelyMapImage(trip.coverImageUrl)) {
    return trip.coverImageUrl;
  }

  return null;
}

function resolveItineraryCoverImage(url: string | null): string | null {
  return isUsableImageUrl(url) ? url : null;
}

export function mapTrip(trip: TripResponse, index: number): Trip {
  const icon = TRIP_ICONS[index % TRIP_ICONS.length];

  return {
    id: String(trip.id),
    title: trip.title,
    dateRange: formatDateRange(trip.startDate, trip.endDate),
    duration: formatDuration(trip.durationDays),
    status: STATUS_MAP[trip.status] ?? 'planning',
    icon: icon.icon,
    iconTone: icon.iconTone,
    coverImageUrl: resolveTripCoverImage(trip),
  };
}

export function mapTrips(trips: TripResponse[]): Trip[] {
  return trips.map((trip, index) => mapTrip(trip, index));
}

export function mapItinerary(itinerary: ItineraryResponse, index: number): FavoriteItinerary {
  return {
    id: String(itinerary.id),
    title: itinerary.title,
    likes: itinerary.likeCount,
    initials: initialsFromTitle(itinerary.title),
    iconTone: ITINERARY_TONES[index % ITINERARY_TONES.length],
    coverImageUrl: resolveItineraryCoverImage(itinerary.coverImageUrl),
    likedByCurrentUser: itinerary.likedByCurrentUser,
  };
}

export function mapItineraries(itineraries: ItineraryResponse[]): FavoriteItinerary[] {
  return itineraries.map((itinerary, index) => mapItinerary(itinerary, index));
}
