import { Component } from '@angular/core';
import { HeaderComponent } from '@components/header/header.component';
import { SidebarComponent } from '@components/sidebar/sidebar.component';
import { ModalComponent } from '@components/modal/modal.component';
import { Calendar, Download, FileText, LucideAngularModule, Plus } from 'lucide-angular';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardApiService } from '@core/dashboard-api.service';
import { EquipmentStatus, GeneratedReport, GenerateReportRequest } from '@core/models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [LucideAngularModule, HeaderComponent, SidebarComponent, ModalComponent, NgFor, NgIf, FormsModule, DatePipe],
  templateUrl: './reports.component.html',
})
export class ReportsComponent {
  plus = Plus;
  fileText = FileText;
  calendar = Calendar;
  download = Download;
  
  reports: GeneratedReport[] = [];
  equipmentList: EquipmentStatus[] = [];
  loading = false;
  error?: string;
  generateDialogOpen = false;

  reportRequest: GenerateReportRequest = {
    date: undefined,
    shift: null,
    lineName: undefined,
    equipmentId: undefined
  };

  constructor(private api: DashboardApiService) {
    this.loadReports();
    this.loadEquipment();
  }

  private loadReports(): void {
    this.loading = true;
    this.error = undefined;

    this.api.getGeneratedReports().subscribe({
      next: (reports) => {
        this.reports = reports;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error ?? err?.message ?? 'Failed to load reports.';
        this.loading = false;
      },
    });
  }

  private loadEquipment(): void {
    this.api.getEquipmentStatus().subscribe({
      next: (equipment) => {
        this.equipmentList = equipment;
      },
      error: () => {
        alert('Failed to load equipment');
      },
    });
  }

  openGenerateDialog(): void {
    this.reportRequest = {
      date: undefined,
      shift: null,
      lineName: undefined,
      equipmentId: undefined
    };
    this.generateDialogOpen = true;
  }

  handleGenerateReport(): void {
    const request: GenerateReportRequest = {
      date: this.reportRequest.date,
      shift: this.reportRequest.shift,
      lineName: this.reportRequest.lineName,
      equipmentId: this.reportRequest.equipmentId
    };

    this.api.createGeneratedReport(request).subscribe({
      next: (created) => {
        this.reports.unshift(created);
        this.generateDialogOpen = false;
      },
      error: () => {
        alert('Failed to generate report');
      },
    });
  }

  downloadReport(report: GeneratedReport): void {
    this.api.downloadGeneratedReport(report.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `report-${new Date(report.createdAt).toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        alert('Failed to download report');
      },
    });
  }

  getFilterSummary(report: GeneratedReport): string {
    const parts: string[] = [];
    if (report.dateFilter) parts.push(report.dateFilter.split('T')[0]);
    if (report.shiftFilter) parts.push(`Shift ${report.shiftFilter}`);
    if (report.lineNameFilter) parts.push(report.lineNameFilter);
    if (report.equipmentName) parts.push(report.equipmentName);
    return parts.length > 0 ? parts.join(' | ') : 'All Data';
  }
}
