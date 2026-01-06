import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DashboardApiService } from '../../core/dashboard-api.service';
import { DashboardSummary } from '../../core/models';

function toDateOnlyString(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  from = toDateOnlyString(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000));
  to = toDateOnlyString(new Date());

  summary?: DashboardSummary;

  loading = false;
  error?: string;

  constructor(private api: DashboardApiService) {
    this.refresh();
  }

  refresh() {
    this.loading = true;
    this.error = undefined;

    forkJoin({
      summary: this.api.getSummary(this.from, this.to),
    }).subscribe({
      next: (res) => {
        this.summary = res.summary;
        this.loading = false;
      },
      error: (error) => {
        this.error = error?.message ?? 'Failed to load dashboard data';
        this.loading = false;
      },
    });
  }
}
