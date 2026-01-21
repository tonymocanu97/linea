import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HeaderComponent } from '@components/header/header.component';
import { SidebarComponent } from '@components/sidebar/sidebar.component';
import { DashboardApiService } from '@core/dashboard-api.service';
import { DashboardSummary, HourlyProductionPoint } from '@core/models';
import { LucideAngularModule } from 'lucide-angular';
import { forkJoin } from 'rxjs';

interface ChartData {
  title: string;
  desc: string;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, LucideAngularModule],
  templateUrl: './analytics.component.html',
})
export class AnalyticsComponent {

  loading = false;

  charts: ChartData[] = [
    {
      title: 'Production Trends',
      desc: 'Weekly output comparison',
    },
    {
      title: 'Efficiency Analysis',
      desc: 'Performance over time',
    },
    {
      title: 'Defect Distribution',
      desc: 'Quality breakdown by category',
    },
    {
      title: 'Energy Consumption',
      desc: 'Resource usage patterns',
    },
  ];

  productionTrendsData: { week: string; production: number; target: number }[] = [];
  maxProductionValue = 0;

  efficiencyData: { day: string; efficiency: number }[] = [];
  maxEfficiency = 100;

  defectData: { type: string; value: number; color: string; percentage: number }[] = [];
  totalDefects = 0;

  energyData: { hour: string; consumption: number }[] = [];
  maxEnergyValue = 0;

  constructor(private api: DashboardApiService) {
    this.loadAnalytics();
  }

  private loadAnalytics(): void {
    this.loading = true;

    const today = new Date();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    forkJoin({
      currentSummary: this.api.getSummary(this.toDateOnlyString(sevenDaysAgo), this.toDateOnlyString(today)),
      currentHourly: this.api.getHourlyProduction(this.toDateOnlyString(sevenDaysAgo), this.toDateOnlyString(today)),
      monthlySummary: this.api.getSummary(this.toDateOnlyString(thirtyDaysAgo), this.toDateOnlyString(today)),
    }).subscribe({
      next: (res) => {
        this.generateProductionTrends(res.currentSummary);
        this.generateEfficiencyAnalysis(res.currentSummary);
        this.generateDefectDistribution(res.currentSummary.topDefects);
        this.generateEnergyConsumption(res.currentHourly);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  private generateProductionTrends(currentSummary: DashboardSummary): void {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const totalProduction = currentSummary.totalGood + currentSummary.totalScrap;
    const weeklyAverage = Math.round(totalProduction / 4);
    const targetPerWeek = 14000;
    
    this.productionTrendsData = weeks.map((week, i) => {
      const weekProduction = Math.round(weeklyAverage * (0.9 + Math.random() * 0.2));
      return {
        week,
        production: weekProduction,
        target: targetPerWeek,
      };
    });
    
    this.maxProductionValue = Math.max(
      ...this.productionTrendsData.map((d) => Math.max(d.production, d.target)),
      1
    );
  }

  private generateEfficiencyAnalysis(summary: DashboardSummary): void {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    const totalGood = summary.totalGood ?? 0;
    const totalScrap = summary.totalScrap ?? 0;
    const totalProduced = totalGood + totalScrap;
    const quality = totalProduced === 0 ? 0 : (totalGood * 100) / totalProduced;
    
    const baseEfficiency = Math.round(quality);
    
    this.efficiencyData = days.map((day) => ({
      day,
      efficiency: Math.max(0, Math.min(100, Math.round(baseEfficiency + (Math.random() * 10 - 5)))),
    }));
  }

  private generateDefectDistribution(topDefects: any[]): void {
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
    
    if (topDefects && topDefects.length > 0) {
      const total = topDefects.reduce((sum, d) => sum + d.quantity, 0);
      this.totalDefects = total;
      
      this.defectData = topDefects.slice(0, 5).map((defect, i) => ({
        type: defect.type,
        value: defect.quantity,
        color: colors[i % colors.length],
        percentage: (defect.quantity / total) * 100,
      }));
    } else {
      this.totalDefects = 0;
      this.defectData = [
        { type: 'No defects', value: 1, color: colors[0], percentage: 100 },
      ];
    }
  }

  private generateEnergyConsumption(hourlyData: HourlyProductionPoint[]): void {
    if (hourlyData && hourlyData.length > 0) {
      const energyPerUnit = 2.5;
      
      this.energyData = hourlyData.slice(0, 24).map((h) => ({
        hour: `${String(h.hour).padStart(2, '0')}:00`,
        consumption: Math.round(h.production * energyPerUnit),
      }));
    } else {
      this.energyData = Array.from({ length: 24 }, (_, i) => ({
        hour: `${String(i).padStart(2, '0')}:00`,
        consumption: 0,
      }));
    }
    this.maxEnergyValue = Math.max(...this.energyData.map((d) => d.consumption), 1);
  }

  private toDateOnlyString(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  getBarHeight(value: number, max: number): number {
    return (value / max) * 100;
  }

  getEfficiencyPoints(): string {
    if (this.efficiencyData.length === 0) return '';
    return this.efficiencyData
      .map((d, i) => {
        const x = 50 + (i * 330) / (this.efficiencyData.length - 1);
        const y = 220 - d.efficiency * 1.9;
        return `${x},${y}`;
      })
      .join(' ');
  }

  getEfficiencyAreaPath(): string {
    if (this.efficiencyData.length === 0) return '';
    let path = 'M 50 220';
    this.efficiencyData.forEach((d, i) => {
      const x = 50 + (i * 330) / (this.efficiencyData.length - 1);
      const y = 220 - d.efficiency * 1.9;
      path += ` L ${x} ${y}`;
    });
    path += ' L 380 220 Z';
    return path;
  }

  getEnergyLinePath(): string {
    if (this.energyData.length === 0) return '';
    return this.energyData
      .map((d, i) => {
        const x = 50 + (i * 330) / (this.energyData.length - 1);
        const y = 220 - (d.consumption / this.maxEnergyValue) * 190;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }

  getEnergyAreaPath(): string {
    if (this.energyData.length === 0) return '';
    let path = 'M 50 220';
    this.energyData.forEach((d, i) => {
      const x = 50 + (i * 330) / (this.energyData.length - 1);
      const y = 220 - (d.consumption / this.maxEnergyValue) * 190;
      path += ` L ${x} ${y}`;
    });
    path += ' L 380 220 Z';
    return path;
  }

  getPieSlicePath(startAngle: number, endAngle: number): string {
    const cx = 100;
    const cy = 100;
    const radius = 80;
    const innerRadius = 50;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    const x3 = cx + innerRadius * Math.cos(endRad);
    const y3 = cy + innerRadius * Math.sin(endRad);
    const x4 = cx + innerRadius * Math.cos(startRad);
    const y4 = cy + innerRadius * Math.sin(startRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${x1},${y1} A ${radius},${radius} 0 ${largeArc},1 ${x2},${y2} L ${x3},${y3} A ${innerRadius},${innerRadius} 0 ${largeArc},0 ${x4},${y4} Z`;
  }

  getDefectSlices(): { path: string; color: string }[] {
    let currentAngle = -90;
    return this.defectData.map((defect) => {
      const sliceAngle = (defect.percentage / 100) * 360;
      const path = this.getPieSlicePath(currentAngle, currentAngle + sliceAngle);
      currentAngle += sliceAngle;
      return { path, color: defect.color };
    });
  }
}
