import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DashboardApiService } from '@shared/services';
import { Cpu, FileText, LucideAngularModule, TriangleAlert } from 'lucide-angular';
import { SEARCH_PAGES } from './constants';
import { filterSearchResults, mapDowntimeToSearchAlert, mapReportToSearchItem } from './utils';

@Component({
  selector: 'app-search-dialog',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './search-dialog.component.html',
})
export class SearchDialogComponent {
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();

  searchQuery = '';
  fileText = FileText;
  alertTriangle = TriangleAlert;
  cpu = Cpu;
  loading = false;

  pages = SEARCH_PAGES;
  equipment: any[] = [];
  alerts: any[] = [];
  reports: any[] = [];

  filteredResults = {
    pages: SEARCH_PAGES,
    equipment: this.equipment,
    alerts: this.alerts,
    reports: this.reports,
  };

  constructor(
    private router: Router,
    private api: DashboardApiService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;

    this.api.getEquipmentStatus().subscribe((equipment) => {
      this.equipment = equipment.map((eq) => ({
        id: eq.id,
        name: eq.name,
        status: eq.status,
        path: '/equipment',
      }));
      this.filter();
    });

    this.api.getActiveDowntimes().subscribe((downtimes) => {
      this.alerts = downtimes.map(mapDowntimeToSearchAlert);
      this.filter();
    });

    this.api.getGeneratedReports().subscribe((reports) => {
      this.reports = reports.map(mapReportToSearchItem);
      this.filter();
      this.loading = false;
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.filter();
  }

  private filter(): void {
    this.filteredResults = filterSearchResults(
      this.searchQuery,
      this.pages,
      this.equipment,
      this.alerts,
      this.reports,
    );
  }

  handleSelect(path: string): void {
    this.router.navigate([path]);
    this.close();
  }

  close(): void {
    this.open = false;
    this.openChange.emit(false);
    this.searchQuery = '';
    this.filter();
  }

  get hasResults(): boolean {
    const r = this.filteredResults;
    return (r.pages.length || r.equipment.length || r.alerts.length || r.reports.length) > 0;
  }
}
