import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { DashboardResponse } from '../models/dashboard-api.models';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/dashboard`;

  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(this.baseUrl);
  }
}
