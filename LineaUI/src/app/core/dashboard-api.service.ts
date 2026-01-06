import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardSummary } from './models';

@Injectable({
  providedIn: 'root',
})
export class DashboardApiService {
  private baseUrl = '/api/dashboard';

  constructor(private http: HttpClient) {}

  getSummary(from: string, to: string, lineName?: string): Observable<DashboardSummary> {
    let params = new HttpParams().set('from', from).set('to', to);
    if (lineName && lineName.trim().length > 0) {
      params = params.set('lineName', lineName.trim());
    }
    return this.http.get<DashboardSummary>(`${this.baseUrl}/summary`, { params });
  }
}
