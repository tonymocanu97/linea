import { Component, OnInit } from '@angular/core';
import { Bell, CircleCheck, CircleX, Funnel, LucideAngularModule, TriangleAlert } from 'lucide-angular';
import { HeaderComponent } from '@components/header/header.component';
import { SidebarComponent } from '@components/sidebar/sidebar.component';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { AlertsBadgeService } from '@core/alerts-badge.service';
import { DashboardApiService } from '@core/dashboard-api.service';
import { Downtime } from '@core/models';

type AlertSeverity = 'error' | 'warning' | 'info' | 'success';

interface AlertItem {
  id: string;
  title: string;
  machine: string;
  severity: AlertSeverity;
  time: string;
  resolved: boolean;
}

interface AlertStat {
  label: string;
  value: number;
  icon: any;
  color?: string;
}

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [LucideAngularModule, HeaderComponent, SidebarComponent, NgClass, NgFor, NgIf],
  templateUrl: './alerts.component.html',
})
export class AlertsComponent implements OnInit {
  funnel = Funnel;
  bell = Bell;
  circleX = CircleX;
  alertTriangle = TriangleAlert;
  circleCheck = CircleCheck;

  alerts: AlertItem[] = [];
  stats: AlertStat[] = [];
  loading = false;
  error?: string;

  constructor(
    private api: DashboardApiService,
    private alertsBadge: AlertsBadgeService,
  ) {}

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    this.loading = true;
    this.error = undefined;

    this.api.getActiveDowntimes().subscribe({
      next: (downtimes) => {
        this.alerts = downtimes.map((d) => this.mapDowntimeToAlert(d));
        this.calculateStats();
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
      title: downtime.reason || downtime.type,
      machine: downtime.equipmentName,
      severity: this.getSeverityFromType(downtime.type),
      time: this.getTimeAgo(downtime.startTime),
      resolved: !!downtime.endTime,
    };
  }

  private getSeverityFromType(downtimeType: string): AlertSeverity {
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

  private calculateStats(): void {
    const total = this.alerts.length;
    const critical = this.alerts.filter(a => a.severity === 'error' && !a.resolved).length;
    const warnings = this.alerts.filter(a => a.severity === 'warning' && !a.resolved).length;
    const resolved = this.alerts.filter(a => a.resolved).length;

    this.stats = [
      { label: 'Total Alerts', value: total, icon: this.bell },
      { label: 'Critical', value: critical, icon: this.circleX, color: 'text-destructive' },
      { label: 'Warnings', value: warnings, icon: this.alertTriangle, color: 'text-warning' },
      { label: 'Resolved', value: resolved, icon: this.circleCheck, color: 'text-success' },
    ];

    this.alertsBadge.setBadgeCount(critical + warnings);
  }

  severityBg(severity: AlertSeverity): string {
    switch (severity) {
      case 'error': return 'bg-destructive/10';
      case 'warning': return 'bg-warning/10';
      case 'success': return 'bg-success/10';
      default: return 'bg-primary/10';
    }
  }

  severityText(severity: AlertSeverity): string {
    switch (severity) {
      case 'error': return 'text-destructive';
      case 'warning': return 'text-warning';
      case 'success': return 'text-success';
      default: return 'text-primary';
    }
  }
}
