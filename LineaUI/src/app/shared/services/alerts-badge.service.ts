import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DashboardApiService } from './dashboard-api.service';
import { Downtime } from './models';

@Injectable({
  providedIn: 'root',
})
export class AlertsBadgeService {
  private readonly countSubject = new BehaviorSubject<number>(0);
  readonly badgeCount$: Observable<number> = this.countSubject.asObservable();

  constructor(private api: DashboardApiService) {}

  setBadgeCount(count: number): void {
    this.countSubject.next(count);
  }

  load(): void {
    this.api.getActiveDowntimes().subscribe({
      next: (downtimes) => {
        const count = this.computeCriticalPlusWarnings(downtimes);
        this.countSubject.next(count);
      },
      error: () => {
        this.countSubject.next(0);
      },
    });
  }

  private computeCriticalPlusWarnings(downtimes: Downtime[]): number {
    return downtimes.filter((d) => {
      if (d.endTime != null) return false;
      const type = d.type.toLowerCase();
      if (type.includes('breakdown')) return true;
      if (type.includes('material')) return false;
      return true;
    }).length;
  }
}
