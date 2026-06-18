export type TripStatusApi =
  | 'PLANNING'
  | 'UPCOMING'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED';

export interface MeResponse {
  id: number;
  fullName: string;
  initials: string;
  email: string;
  avatarUrl: string | null;
}

export interface NotificationSummaryResponse {
  unreadCount: number;
}

export interface TripResponse {
  id: number;
  title: string;
  destination: string;
  lat: number | null;
  lng: number | null;
  startDate: string | null;
  endDate: string | null;
  status: TripStatusApi;
  travelerCount: number;
  coverImageUrl: string | null;
  durationDays: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ItineraryResponse {
  id: number;
  tripId: number;
  title: string;
  public: boolean;
  likeCount: number;
  coverImageUrl: string | null;
  likedByCurrentUser: boolean;
  createdAt: string;
}

export interface DashboardResponse {
  me: MeResponse;
  notificationsSummary: NotificationSummaryResponse;
  myTrips: TripResponse[];
  favoriteItineraries: ItineraryResponse[];
}

export interface CreateDraftTripResponse {
  tripId: number;
}

export interface GeoMarkerResponse {
  tripId: number;
  title: string;
  destination: string;
  lat: number;
  lng: number;
}

export interface SuggestedDestinationResponse {
  name: string;
  country: string;
  reason: string;
  imageUrl: string | null;
  lat: number | null;
  lng: number | null;
}

export interface CursorPage<T> {
  items: T[];
  nextCursor: number | null;
  hasMore: boolean;
}
