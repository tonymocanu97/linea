import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DashboardApiService } from '@core/dashboard-api.service';
import { Downtime } from '@core/models';
import {
  Clock,
  LucideAngularModule,
  TriangleAlert,
  Wrench,
  X,
} from 'lucide-angular';

export type AlertType = 'warning' | 'error' | 'info';

export interface AlertItem {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  time: string;
  equipment?: string;
}

@Component({
  selector: 'app-alerts-list',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, LucideAngularModule],
  templateUrl: './alerts-list.component.html',
})
export class AlertsListComponent implements OnInit {
  alertTriangle = TriangleAlert;
  wrench = Wrench;
  clock = Clock;
  close = X;

  animationDelay = '400ms';

  alerts: AlertItem[] = [];
  displayedAlerts: AlertItem[] = [];
  loading = false;
  error?: string;

  constructor(private api: DashboardApiService) {}

  ngOnInit(): void {
    this.loadActiveAlerts();
  }

  loadActiveAlerts(): void {
    this.loading = true;
    this.error = undefined;

    this.api.getActiveDowntimes().subscribe({
      next: (downtimes) => {
        this.alerts = downtimes.map((d) => this.mapDowntimeToAlert(d));
        this.displayedAlerts = this.alerts.slice(0, 3);
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error ?? err?.message ?? 'Failed to load alerts';
        this.loading = false;
      },
    });
  }

  private mapDowntimeToAlert(downtime: Downtime): AlertItem {
    return {
      id: downtime.id,
      type: this.getAlertType(downtime.type),
      title: downtime.reason || downtime.type,
      description: `${downtime.lineName} stopped due to ${downtime.reason || downtime.type}`,
      time: this.getTimeAgo(downtime.startTime),
      equipment: downtime.equipmentName,
    };
  }

  private getAlertType(downtimeType: string): AlertType {
    const type = downtimeType.toLowerCase();
    if (type.includes('breakdown')) return 'error';
    if (type.includes('maintenance')) return 'warning';
    if (type.includes('material')) return 'info';
    return 'warning';
  }

    private getTimeAgo(startTime: string): string {
    const now = new Date();
    const start = new Date(startTime);
    const diffMs = now.getTime() - start.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  getAlertStyles(type: AlertType) {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-destructive/10 border-destructive/30',
          icon: 'text-destructive',
        };
      case 'warning':
        return {
          bg: 'bg-warning/10 border-warning/30',
          icon: 'text-warning',
        };
      default:
        return {
          bg: 'bg-primary/10 border-primary/30',
          icon: 'text-primary',
        };
    }
  }

  dismiss(alertId: string): void {
    this.alerts = this.alerts.filter((a) => a.id !== alertId);
    this.displayedAlerts = this.alerts.slice(0, 3);
  }
}
