import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AlertsBadgeService, SettingsService } from '@shared/services';
import { Factory, LucideAngularModule } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { MANAGEMENT_NAV, OVERVIEW_NAV, PRODUCTION_NAV } from './constants';
import { NavItem } from './models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, NgFor, NgIf, LucideAngularModule],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit, OnDestroy {
  overviewItems: NavItem[] = OVERVIEW_NAV;
  productionItems: NavItem[] = PRODUCTION_NAV;
  managementItems: NavItem[] = MANAGEMENT_NAV;

  alertsBadgeCount = 0;
  factory = Factory;
  companyName = 'Production Form';

  private destroy$ = new Subject<void>();

  constructor(
    private alertsBadge: AlertsBadgeService,
    private settingsService: SettingsService,
  ) {}

  ngOnInit(): void {
    this.alertsBadge.load();

    this.alertsBadge.badgeCount$.pipe(takeUntil(this.destroy$)).subscribe((count) => {
      this.alertsBadgeCount = count;
    });

    this.companyName = this.settingsService.getCompanyName();

    this.settingsService.companyName$.pipe(takeUntil(this.destroy$)).subscribe((name) => {
      this.companyName = name;
    });
  }

  getBadgeCount(item: NavItem): number | undefined {
    if (item.route === '/alerts') {
      return this.alertsBadgeCount;
    }

    return item.badge;
  }

  showComingSoon(): void {
    alert('🚧 Coming soon');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
