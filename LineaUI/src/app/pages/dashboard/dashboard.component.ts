import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent, SidebarComponent } from '@components';
import { DashboardApiService, DashboardSummary, EquipmentStatus } from '@shared/services';
import { toDateOnlyString } from '@shared/utils';
import { Gauge, Package, PackageCheck, PackageMinus, Timer } from 'lucide-angular';
import { catchError, forkJoin, of } from 'rxjs';
import {
  AlertsListComponent,
  EquipmentStatusComponent,
  MetricCardComponent,
  OeeGaugeComponent,
  ProductionChartComponent,
} from './components';
import {
  buildProductionChartData,
  calculateDowntimeFromRecords,
  calculateProductionRatePerHour,
  computeOeeMetrics,
} from './models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    OeeGaugeComponent,
    MetricCardComponent,
    ProductionChartComponent,
    AlertsListComponent,
    EquipmentStatusComponent,
    SidebarComponent,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  from = toDateOnlyString(new Date(Date.now() - 6 * 86400000));
  to = toDateOnlyString(new Date());
  gauge = Gauge;
  timer = Timer;
  package = Package;
  packageMinus = PackageMinus;
  packageCheck = PackageCheck;

  summary?: DashboardSummary;
  loading = false;
  error?: string;

  productionChartData: any[] = [];
  metrics = {
    availability: 0,
    performance: 0,
    quality: 0,
    oee: 0,
  };

  equipmentStatusData: EquipmentStatus[] = [];

  get totalOutput(): number {
    return (this.summary?.totalGood ?? 0) + (this.summary?.totalScrap ?? 0);
  }

  get goodUnits(): number {
    return this.summary?.totalGood ?? 0;
  }

  get scrapUnits(): number {
    return this.summary?.totalScrap ?? 0;
  }

  get downtimeMinutes(): number {
    return this.summary?.totalDowntimeMinutes ?? 0;
  }

  constructor(private api: DashboardApiService) {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.error = undefined;

    forkJoin({
      summary: this.api.getSummary(this.from, this.to),
      hourly: this.api.getHourlyProduction(this.from, this.to),
      equipment: this.api.getEquipmentStatus(),
      downtimes: this.api.getDowntimes(this.from, this.to).pipe(catchError(() => of([]))),
    }).subscribe({
      next: (res) => {
        this.summary = res.summary;

        const calculatedDowntime = calculateDowntimeFromRecords(res.downtimes, this.from, this.to);

        if (
          calculatedDowntime > 0 &&
          (!this.summary.totalDowntimeMinutes || this.summary.totalDowntimeMinutes === 0)
        ) {
          this.summary.totalDowntimeMinutes = calculatedDowntime;
        }

        this.metrics = computeOeeMetrics(this.summary);

        this.productionChartData = buildProductionChartData(res.hourly);

        this.equipmentStatusData = res.equipment;

        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error ?? err?.message ?? 'Failed to load dashboard.';
        this.loading = false;
      },
    });
  }

  get productionRatePerHour(): number {
    if (!this.summary) return 0;
    return calculateProductionRatePerHour(this.summary);
  }
}
