import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HeaderComponent, SidebarComponent } from '@components';
import { DashboardApiService } from '@shared/services';
import { toDateOnlyString } from '@shared/utils';
import { LucideAngularModule } from 'lucide-angular';
import { forkJoin } from 'rxjs';
import { ANALYTICS_CHARTS } from './constants';
import {
  buildDefectDistribution,
  buildEfficiencyAnalysis,
  buildEnergyConsumption,
  buildProductionTrends,
  getBarHeight,
  getDefectSlices,
  getEfficiencyAreaPath,
  getEfficiencyPoints,
  getEnergyAreaPath,
  getEnergyLinePath,
} from './utils';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, LucideAngularModule],
  templateUrl: './analytics.component.html',
})
export class AnalyticsComponent {
  loading = false;
  charts = ANALYTICS_CHARTS;

  productionTrendsData: any[] = [];
  maxProductionValue = 0;

  efficiencyData: any[] = [];
  maxEfficiency = 100;

  defectData: any[] = [];
  totalDefects = 0;

  energyData: any[] = [];
  maxEnergyValue = 0;

  readonly getBarHeight = getBarHeight;

  getEfficiencyAreaPath(): string {
    return getEfficiencyAreaPath(this.efficiencyData);
  }

  getEfficiencyPoints(): string {
    return getEfficiencyPoints(this.efficiencyData);
  }

  getDefectSlices(): { path: string; color: string }[] {
    return getDefectSlices(this.defectData);
  }

  getEnergyAreaPath(): string {
    return getEnergyAreaPath(this.energyData, this.maxEnergyValue);
  }

  getEnergyLinePath(): string {
    return getEnergyLinePath(this.energyData, this.maxEnergyValue);
  }

  constructor(private api: DashboardApiService) {
    this.loadAnalytics();
  }

  private loadAnalytics(): void {
    this.loading = true;

    const today = new Date();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    forkJoin({
      currentSummary: this.api.getSummary(toDateOnlyString(sevenDaysAgo), toDateOnlyString(today)),
      currentHourly: this.api.getHourlyProduction(
        toDateOnlyString(sevenDaysAgo),
        toDateOnlyString(today),
      ),
      monthlySummary: this.api.getSummary(toDateOnlyString(thirtyDaysAgo), toDateOnlyString(today)),
    }).subscribe({
      next: (res) => {
        const production = buildProductionTrends(res.currentSummary);
        this.productionTrendsData = production.data;
        this.maxProductionValue = production.maxValue;

        const efficiency = buildEfficiencyAnalysis(res.currentSummary);
        this.efficiencyData = efficiency.data;

        const defects = buildDefectDistribution(res.currentSummary.topDefects);
        this.defectData = defects.data;
        this.totalDefects = defects.total;

        const energy = buildEnergyConsumption(res.currentHourly);
        this.energyData = energy.data;
        this.maxEnergyValue = energy.maxValue;

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
