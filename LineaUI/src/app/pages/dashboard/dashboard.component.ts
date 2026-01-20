import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertsListComponent } from '@components/alerts-list/alerts-list.component';
import { HeaderComponent } from '@components/header/header.component';
import { MetricCardComponent } from '@components/metric-card/metric-card.component';
import { OeeGaugeComponent } from '@components/oee-gauge/oee-gauge.component';
import { ProductionChartComponent } from '@components/production-chart/production-chart.component';
import { DashboardApiService } from '@core/dashboard-api.service';
import { DashboardSummary, HourlyProductionPoint } from '@core/models';
import { Gauge, Package, PackageCheck, PackageMinus, TimerIcon } from 'lucide-angular';
import { forkJoin } from 'rxjs';

function toDateOnlyString(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function daysInclusive(fromDateOnly: string, toDateOnly: string): number {
  const from = new Date(fromDateOnly);
  const to = new Date(toDateOnly);
  const diffMs = to.getTime() - from.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, days);
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, OeeGaugeComponent, MetricCardComponent, ProductionChartComponent, AlertsListComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  from = toDateOnlyString(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000));
  to = toDateOnlyString(new Date());
  
  package = Package;
  packageCheck = PackageCheck;
  packageMinus = PackageMinus;
  timer = TimerIcon;
  gauge = Gauge;

  summary?: DashboardSummary;

  loading = false;
  error?: string;

  productionChartData: {
    time: string;
    production: number;
    target: number;
  }[] = [];

  metrics = {
    availability: 0,
    performance: 0,
    quality: 0,
    oee: 0,
  };

  private readonly targetUnitsPerDay = 2000;
  private readonly plannedMinutesPerDay = 24 * 60;

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

  get productionRatePerHour(): number {
    if (!this.summary) return 0;

    const totalGood = this.summary.totalGood ?? 0;
    const totalScrap = this.summary.totalScrap ?? 0;
    const totalProduced = totalGood + totalScrap;

    const days = daysInclusive(this.summary.from, this.summary.to);
    const plannedMinutes = days * this.plannedMinutesPerDay;

    if (plannedMinutes <= 0) return 0;
    const ratePerHour = (totalProduced / plannedMinutes) * 60;

    return Math.round(ratePerHour);
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
    }).subscribe({
      next: (res) => {
        this.summary = res.summary;
        this.metrics = this.computeOeeMetrics(res.summary);
        this.productionChartData = this.buildProductionChartData(res.hourly);
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error ?? err?.message ?? 'Failed to load dashboard.';
        this.loading = false;
      },
    });
  }

  private computeOeeMetrics(s: DashboardSummary) {
    const totalGood = s.totalGood ?? 0;
    const totalScrap = s.totalScrap ?? 0;
    const totalProduced = totalGood + totalScrap;

    const quality = totalProduced === 0 ? 0 : (totalGood * 100) / totalProduced;

    const days = daysInclusive(s.from, s.to);
    const plannedMinutes = days * this.plannedMinutesPerDay;
    const downtime = s.totalDowntimeMinutes ?? 0;
    const availability =
      plannedMinutes <= 0 ? 0 : ((plannedMinutes - downtime) * 100) / plannedMinutes;

    const target = days * this.targetUnitsPerDay;
    const performance = target <= 0 ? 0 : Math.min(100, (totalProduced * 100) / target);

    const oee = (availability / 100) * (performance / 100) * (quality / 100) * 100;

    return {
      availability: this.clampAndRound(availability),
      performance: this.clampAndRound(performance),
      quality: this.clampAndRound(quality),
      oee: this.clampAndRound(oee),
    };
  }

  private clampAndRound(v: number): number {
    const n = Number(v);
    if (Number.isNaN(n)) return 0;
    return Math.round(Math.max(0, Math.min(100, n)));
  }

  private buildProductionChartData(hourly: HourlyProductionPoint[]) {
    if (!hourly || hourly.length === 0) {
      return [];
    }

    return hourly
      .sort((a, b) => a.hour - b.hour)
      .map(h => ({
        time: `${String(h.hour).padStart(2, '0')}:00`,
        production: h.production,
        target: h.target,
      }));
  }
}
