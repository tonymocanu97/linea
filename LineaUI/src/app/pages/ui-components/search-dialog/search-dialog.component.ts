import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DashboardApiService, EquipmentStatus, GeneratedReport } from '@shared';
import {
  Activity,
  ChartColumn,
  Cpu,
  FileText,
  LayoutDashboard,
  LucideAngularModule,
  Settings,
  TriangleAlert,
  Users,
} from 'lucide-angular';

interface SearchPage {
  id: string;
  name: string;
  path: string;
  icon: any;
}

interface SearchEquipment {
  id: string;
  name: string;
  status: EquipmentStatus['status'];
  path: string;
}

interface SearchAlert {
  id: string;
  name: string;
  severity: 'error' | 'warning' | 'info';
  path: string;
}

interface SearchReport {
  id: string;
  name: string;
  type: string;
  path: string;
}

interface FilteredResults {
  pages: SearchPage[];
  equipment: SearchEquipment[];
  alerts: SearchAlert[];
  reports: SearchReport[];
}

@Component({
  selector: 'app-search-dialog',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './search-dialog.component.html',
})
export class SearchDialogComponent implements OnInit {
  private _open = false;
  
  @Input()
  get open(): boolean {
    return this._open;
  }
  set open(value: boolean) {
    this._open = value;
    this.openChange.emit(value);
    if (value) {
      this.loadData();
    }
  }
  
  @Output() openChange = new EventEmitter<boolean>();

  searchQuery = '';
  loading = false;
  error?: string;

  layoutDashboard = LayoutDashboard;
  activity = Activity;
  barChart = ChartColumn;
  cpu = Cpu;
  fileText = FileText;
  alertTriangle = TriangleAlert;
  users = Users;
  settings = Settings;

  pages: SearchPage[] = [
    { id: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: this.layoutDashboard },
    { id: 'realtime', name: 'Real-time Monitor', path: '/monitor', icon: this.activity },
    { id: 'analytics', name: 'Analytics', path: '/analytics', icon: this.barChart },
    { id: 'equipment', name: 'Equipment', path: '/equipment', icon: this.cpu },
    { id: 'reports', name: 'Reports', path: '/reports', icon: this.fileText },
    { id: 'alerts', name: 'Alerts', path: '/alerts', icon: this.alertTriangle },
    { id: 'users', name: 'Users', path: '/users', icon: this.users },
    { id: 'settings', name: 'Settings', path: '/settings', icon: this.settings },
  ];

  equipment: SearchEquipment[] = [];
  alerts: SearchAlert[] = [];
  reports: SearchReport[] = [];

  filteredResults: FilteredResults = {
    pages: [],
    equipment: [],
    alerts: [],
    reports: [],
  };

  constructor(
    private router: Router,
    private api: DashboardApiService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = undefined;

    this.api.getEquipmentStatus().subscribe({
      next: (equipment) => {
        this.equipment = equipment.map((eq) => ({
          id: eq.id,
          name: eq.name,
          status: eq.status,
          path: '/equipment',
        }));
        this.filterResults();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });

    this.api.getActiveDowntimes().subscribe({
      next: (downtimes) => {
        this.alerts = downtimes.map((downtime) => ({
          id: downtime.id,
          name: `${this.getSeverityLabel(downtime.type)} - ${downtime.equipmentName}`,
          severity: this.getSeverityFromType(downtime.type),
          path: '/alerts',
        }));
        this.filterResults();
      },
      error: () => {
      },
    });

    this.api.getGeneratedReports().subscribe({
      next: (reports) => {
        this.reports = reports.map((report) => ({
          id: report.id,
          name: this.getReportName(report),
          type: this.getReportType(report),
          path: '/reports',
        }));
        this.filterResults();
      },
      error: () => {
      },
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.filterResults();
  }

  filterResults(): void {
    const query = this.searchQuery.toLowerCase().trim();

    if (!query) {
      this.filteredResults = {
        pages: [],
        equipment: [],
        alerts: [],
        reports: [],
      };
      return;
    }

    this.filteredResults = {
      pages: this.pages.filter((item) => item.name.toLowerCase().includes(query)),
      equipment: this.equipment.filter(
        (item) =>
          item.name.toLowerCase().includes(query) || item.id.toLowerCase().includes(query),
      ),
      alerts: this.alerts.filter((item) => item.name.toLowerCase().includes(query)),
      reports: this.reports.filter((item) => item.name.toLowerCase().includes(query)),
    };
  }

  handleSelect(path: string): void {
    this.router.navigate([path]);
    this.close();
    this.searchQuery = '';
    this.filterResults();
  }

  close(): void {
    this._open = false;
    this.openChange.emit(false);
    this.searchQuery = '';
    this.filterResults();
  }

  get hasResults(): boolean {
    return (
      this.filteredResults.pages.length > 0 ||
      this.filteredResults.equipment.length > 0 ||
      this.filteredResults.alerts.length > 0 ||
      this.filteredResults.reports.length > 0
    );
  }

  private getSeverityFromType(downtimeType: string): 'error' | 'warning' | 'info' {
    const type = downtimeType.toLowerCase();
    if (type.includes('breakdown')) return 'error';
    if (type.includes('maintenance')) return 'warning';
    return 'info';
  }

  private getSeverityLabel(downtimeType: string): string {
    const type = downtimeType.toLowerCase();
    if (type.includes('breakdown')) return 'Breakdown';
    if (type.includes('maintenance')) return 'Maintenance Due';
    if (type.includes('material')) return 'Material Issue';
    return 'Alert';
  }

  private getReportName(report: GeneratedReport): string {
    if (report.equipmentName) {
      return `${report.equipmentName} Report`;
    }
    if (report.lineNameFilter) {
      return `${report.lineNameFilter} Production Report`;
    }
    return 'Production Report';
  }

  private getReportType(report: GeneratedReport): string {
    if (report.equipmentIdFilter) return 'Equipment';
    if (report.lineNameFilter) return 'Production';
    return 'General';
  }
}
