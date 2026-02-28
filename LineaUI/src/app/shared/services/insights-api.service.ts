import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface InsightsRequest {
  question: string;
  from?: string;
  to?: string;
  lineName?: string;
}

export interface InsightsResponse {
  answer: string;
}

@Injectable({
  providedIn: 'root',
})
export class InsightsApiService {
  private baseUrl = '/api/insights';

  constructor(private http: HttpClient) {}

  ask(request: InsightsRequest): Observable<InsightsResponse> {
    const body: Record<string, unknown> = {
      question: request.question,
    };
    if (request.from) body['from'] = request.from;
    if (request.to) body['to'] = request.to;
    if (request.lineName?.trim()) body['lineName'] = request.lineName.trim();

    return this.http.post<InsightsResponse>(`${this.baseUrl}/ask`, body);
  }
}
