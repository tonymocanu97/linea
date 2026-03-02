import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface UserResponse {
  id: string;
  username: string;
  role: number | string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsersApiService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>('/api/users');
  }

  create(username: string, password: string, role: string): Observable<UserResponse> {
    const roleNum = role === 'Operator' ? 0 : role === 'Engineer' ? 1 : 2;
    return this.http.post<UserResponse>('/api/users', {
      username,
      password,
      role: roleNum,
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/users/${id}`);
  }
}
