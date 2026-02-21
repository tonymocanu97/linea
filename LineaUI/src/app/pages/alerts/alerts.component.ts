import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HeaderComponent, SidebarComponent } from '@components';
import { AlertsBadgeService, DashboardApiService } from '@shared/services';
import { Bell, CircleCheck, CircleX, LucideAngularModule, TriangleAlert } from 'lucide-angular';
import { BehaviorSubject, finalize, map, tap } from 'rxjs';
import { SEVERITY_STYLES } from './constants';
import { mapDowntimeToAlert } from './mappers';
import { Alert, AlertSeverity, AlertStat } from './models';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [
    AsyncPipe,
    LucideAngularModule,
    HeaderComponent,
    SidebarComponent,
    NgClass,
    NgFor,
    NgIf,
  ],
  templateUrl: './alerts.component.html',
})
export class AlertsComponent implements OnInit {
  readonly SEVERITY_STYLES = SEVERITY_STYLES;
  readonly alertTriangle = TriangleAlert;

  private readonly _alerts$ = new BehaviorSubject<Alert[]>([]);
  readonly alerts$ = this._alerts$.asObservable();

  readonly stats$ = this.alerts$.pipe(map((alerts) => this.buildStats(alerts)));

  readonly loading$ = new BehaviorSubject<boolean>(false);
  readonly error$ = new BehaviorSubject<string | null>(null);

  constructor(
    private api: DashboardApiService,
    private badge: AlertsBadgeService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading$.next(true);
    this.error$.next(null);

    this.api
      .getActiveDowntimes()
      .pipe(
        map((d) => d.map(mapDowntimeToAlert)),
        tap((alerts) => {
          this._alerts$.next(alerts);
          this.updateBadge(alerts);
        }),
        finalize(() => this.loading$.next(false)),
      )
      .subscribe({
        error: (err) => {
          this.error$.next(err?.error?.error ?? err?.message ?? 'Failed to load alerts');
        },
      });
  }

  private buildStats(alerts: Alert[]): AlertStat[] {
    const total = alerts.length;
    const critical = alerts.filter((a) => a.severity === AlertSeverity.Error && !a.resolved).length;

    const warnings = alerts.filter(
      (a) => a.severity === AlertSeverity.Warning && !a.resolved,
    ).length;

    const resolved = alerts.filter((a) => a.resolved).length;

    this.updateBadge(alerts);

    return [
      { label: 'Total Alerts', value: total, icon: Bell },
      { label: 'Critical', value: critical, icon: CircleX, color: 'text-destructive' },
      { label: 'Warnings', value: warnings, icon: TriangleAlert, color: 'text-warning' },
      { label: 'Resolved', value: resolved, icon: CircleCheck, color: 'text-success' },
    ];
  }

  private updateBadge(alerts: Alert[]) {
    const active = alerts.filter((a) => !a.resolved).length;
    this.badge.setBadgeCount(active);
  }
}
