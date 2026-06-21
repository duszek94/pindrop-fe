import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type {
  PlaceResult,
  PreferenceProfile,
  ProposalType,
  TripItinerary,
  TripProposal,
} from '../models/plan-trip.models';

@Injectable({ providedIn: 'root' })
export class PlanTripApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api`;

  searchPlaces(query: string): Observable<PlaceResult[]> {
    return this.http.get<PlaceResult[]>(`${this.baseUrl}/places/search`, {
      params: { q: query, limit: '8' },
    });
  }

  reversePlace(lat: number, lng: number): Observable<PlaceResult> {
    return this.http.get<PlaceResult>(`${this.baseUrl}/places/reverse`, {
      params: { lat: String(lat), lng: String(lng) },
    });
  }

  getPopularDestinations(limit = 6): Observable<PlaceResult[]> {
    return this.http.get<PlaceResult[]>(`${this.baseUrl}/places/popular`, {
      params: { limit: String(limit) },
    });
  }

  updateDestination(
    tripId: number,
    body: {
      destination: string;
      lat: number;
      lng: number;
      startDate: string;
      endDate: string;
    },
  ): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/trips/${tripId}/wizard/destination`, body);
  }

  updatePreferences(tripId: number, body: { preferenceProfile: PreferenceProfile }): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/trips/${tripId}/wizard/preferences`, body);
  }

  updateInterests(tripId: number, interests: string[]): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/trips/${tripId}/wizard/interests`, { interests });
  }

  generateProposals(tripId: number): Observable<TripProposal[]> {
    return this.http.post<TripProposal[]>(`${this.baseUrl}/trips/${tripId}/proposals/generate`, null);
  }

  getProposals(tripId: number): Observable<TripProposal[]> {
    return this.http.get<TripProposal[]>(`${this.baseUrl}/trips/${tripId}/proposals`);
  }

  selectProposal(tripId: number, type: ProposalType): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/trips/${tripId}/proposals/select`, { type });
  }

  getItinerary(tripId: number, day?: number): Observable<TripItinerary> {
    const options = day != null ? { params: { day: String(day) } } : {};
    return this.http.get<TripItinerary>(`${this.baseUrl}/trips/${tripId}/itinerary`, options);
  }

  regenerateActivity(tripId: number, activityId: number): Observable<TripItinerary> {
    return this.http.post<TripItinerary>(
      `${this.baseUrl}/trips/${tripId}/itinerary/activities/${activityId}/regenerate`,
      null,
    );
  }

  regenerateItinerary(tripId: number): Observable<TripProposal[]> {
    return this.http.post<TripProposal[]>(`${this.baseUrl}/trips/${tripId}/itinerary/regenerate`, null);
  }

  saveTrip(tripId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/trips/${tripId}/save`, null);
  }
}
