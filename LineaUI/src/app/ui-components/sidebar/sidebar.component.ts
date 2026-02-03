import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AlertsBadgeService } from '@core/alerts-badge.service';
import {
  Activity,
  ChartColumn,
  Cpu,
  Factory,
  FileText,
  LayoutDashboard,
  LucideAngularModule,
  Settings,
  TriangleAlert,
  Users,
} from 'lucide-angular';

interface NavItem {
  label: string;
  icon: any;
  route?: string;
  badge?: number;
  comingSoon?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, NgFor, NgIf, LucideAngularModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  layoutDashboard = LayoutDashboard;
  activity = Activity;
  fileText = FileText;
  settings = Settings;
  users = Users;
  alertTriangle = TriangleAlert;
  barChart = ChartColumn;
  cpu = Cpu;
  factory = Factory;

  alertsBadgeCount = 0;

  overviewItems: NavItem[] = [
    { label: 'Dashboard', icon: this.layoutDashboard, route: '/dashboard' },
    { label: 'Real-time Monitor', icon: this.activity, comingSoon: true },
    { label: 'Analytics', icon: this.barChart, route: '/analytics' },
  ];

  productionItems: NavItem[] = [
    { label: 'Equipment', icon: this.cpu, route: '/equipment' },
    { label: 'Reports', icon: this.fileText, route: '/reports' },
    { label: 'Alerts', icon: this.alertTriangle, route: '/alerts' },
  ];

  constructor(private alertsBadge: AlertsBadgeService) {}

  ngOnInit(): void {
    this.alertsBadge.load();
    this.alertsBadge.badgeCount$.subscribe((count) => (this.alertsBadgeCount = count));
  }

  getBadgeCount(item: NavItem): number | undefined {
    if (item.route === '/alerts') {
      return this.alertsBadgeCount;
    }
    return item.badge;
  }

  managementItems: NavItem[] = [
    { label: 'Users', icon: this.users, comingSoon: true },
    { label: 'Settings', icon: this.settings, route: '/settings' },
  ];

  showComingSoon() {
    alert('🚧 Coming soon');
  }
}
