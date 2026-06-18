export type TripStatus = 'upcoming' | 'planning' | 'active' | 'completed' | 'cancelled';

export interface Trip {
  id: string;
  title: string;
  dateRange: string;
  duration: string;
  status: TripStatus;
  icon: string;
  iconTone: 'rose' | 'amber' | 'emerald' | 'sky';
}

export interface FavoriteItinerary {
  id: string;
  title: string;
  likes: number;
  initials: string;
  iconTone: 'emerald' | 'indigo' | 'sky';
  coverImageUrl?: string | null;
  likedByCurrentUser?: boolean;
}

export type DashboardNavId = 'home' | 'explore' | 'trips' | 'favorites' | 'profile';

export interface DashboardNavItem {
  id: DashboardNavId;
  route: string;
  icon: string;
  labelKey: string;
}
