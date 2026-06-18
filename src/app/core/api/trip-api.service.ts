import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type {
  CreateDraftTripResponse,
  CursorPage,
  GeoMarkerResponse,
  TripResponse,
} from '../models/dashboard-api.models';

@Injectable({ providedIn: 'root' })
export class TripApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/trips`;

  createDraft(): Observable<CreateDraftTripResponse> {
    return this.http.post<CreateDraftTripResponse>(`${this.baseUrl}/draft`, null);
  }

  listTrips(scope = 'mine', cursor?: number, limit?: number): Observable<CursorPage<TripResponse>> {
    let params = new HttpParams().set('scope', scope);
    if (cursor != null) {
      params = params.set('cursor', cursor);
    }
    if (limit != null) {
      params = params.set('limit', limit);
    }
    return this.http.get<CursorPage<TripResponse>>(this.baseUrl, { params });
  }

  getGeoMarkers(): Observable<GeoMarkerResponse[]> {
    return this.http.get<GeoMarkerResponse[]>(`${this.baseUrl}/geo`);
  }

  getTrip(id: number): Observable<TripResponse> {
    return this.http.get<TripResponse>(`${this.baseUrl}/${id}`);
  }
}
