import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardApiService } from '@shared/services';
import { Clock, LucideAngularModule, TriangleAlert, Wrench, X } from 'lucide-angular';
import { ALERT_STYLE_MAP } from './constants';
import { mapDowntimeToDashboardAlert } from './mappers';
import { AlertItem, AlertType } from './models';

@Component({
  selector: 'app-alerts-list',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, LucideAngularModule, RouterModule],
  templateUrl: './alerts-list.component.html',
})
export class AlertsListComponent implements OnInit {
  alerts: AlertItem[] = [];
  displayedAlerts: AlertItem[] = [];

  alertTriangle = TriangleAlert;
  wrench = Wrench;
  clock = Clock;
  close = X;

  animationDelay = '400ms';

  constructor(private api: DashboardApiService) {}

  ngOnInit(): void {
    this.loadActiveAlerts();
  }

  private loadActiveAlerts(): void {
    this.api.getActiveDowntimes().subscribe((downtimes) => {
      this.alerts = downtimes.map(mapDowntimeToDashboardAlert);

      this.displayedAlerts = this.alerts.slice(0, 3);
    });
  }

  getAlertStyles(type: AlertType) {
    return ALERT_STYLE_MAP[type];
  }

  dismiss(id: string): void {
    this.alerts = this.alerts.filter((a) => a.id !== id);
    this.displayedAlerts = this.alerts.slice(0, 3);
  }
}
