import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { SuggestedDestinationResponse } from '../models/dashboard-api.models';

@Injectable({ providedIn: 'root' })
export class AiApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/ai`;

  getSuggestedDestinations(): Observable<SuggestedDestinationResponse[]> {
    return this.http.get<SuggestedDestinationResponse[]>(`${this.baseUrl}/suggested-destinations`);
  }
}
