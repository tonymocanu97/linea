import { DatePipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent, SidebarComponent } from '@components';
import { ModalComponent } from '@shared/modals';
import {
  DashboardApiService,
  EquipmentStatus,
  GeneratedReport,
  GenerateReportRequest,
} from '@shared/services';
import { Calendar, Download, FileText, LucideAngularModule, Plus } from 'lucide-angular';
import { createEmptyReportRequest } from './models';
import { buildFilterSummary, downloadBlob } from './utils';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    LucideAngularModule,
    HeaderComponent,
    SidebarComponent,
    NgFor,
    NgIf,
    FormsModule,
    DatePipe,
    ModalComponent,
  ],
  templateUrl: './reports.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  reportRequest: GenerateReportRequest = createEmptyReportRequest();

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
    this.reportRequest = createEmptyReportRequest();
    this.generateDialogOpen = true;
  }

  handleGenerateReport(): void {
    this.api.createGeneratedReport(this.reportRequest).subscribe({
      next: (created) => {
        this.reports = [created, ...this.reports];
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
        const filename = `report-${new Date(report.createdAt).toISOString().split('T')[0]}.csv`;

        downloadBlob(blob, filename);
      },
      error: () => {
        alert('Failed to download report');
      },
    });
  }

  getFilterSummary(report: GeneratedReport): string {
    return buildFilterSummary(report);
  }
}
