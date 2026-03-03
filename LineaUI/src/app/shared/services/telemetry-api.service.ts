import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TelemetryApiService {
  constructor(private http: HttpClient) {}

  generateData(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/api/telemetry/generate', {});
  }

  resetData(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/api/telemetry/reset', {});
  }
}
