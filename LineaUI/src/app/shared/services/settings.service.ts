import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly companyNameSubject = new BehaviorSubject<string>('Production Form');
  readonly companyName$: Observable<string> = this.companyNameSubject.asObservable();

  private readonly timezoneSubject = new BehaviorSubject<string>('UTC+2 (Central European Time)');
  readonly timezone$: Observable<string> = this.timezoneSubject.asObservable();

  constructor() {
    const savedCompanyName = localStorage.getItem('companyName');
    const savedTimezone = localStorage.getItem('timezone');

    if (savedCompanyName) {
      this.companyNameSubject.next(savedCompanyName);
    }
    if (savedTimezone) {
      this.timezoneSubject.next(savedTimezone);
    }
  }

  getCompanyName(): string {
    return this.companyNameSubject.value;
  }

  setCompanyName(name: string): void {
    this.companyNameSubject.next(name);
    localStorage.setItem('companyName', name);
  }

  getTimezone(): string {
    return this.timezoneSubject.value;
  }

  setTimezone(timezone: string): void {
    this.timezoneSubject.next(timezone);
    localStorage.setItem('timezone', timezone);
  }

  getTimezoneOffset(): number {
    const timezone = this.getTimezone();
    const match = timezone.match(/UTC([+-]?\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    const simpleMatch = timezone.match(/([+-]?\d+)/);
    if (simpleMatch) {
      return parseInt(simpleMatch[1], 10);
    }
    return 2;
  }
}
