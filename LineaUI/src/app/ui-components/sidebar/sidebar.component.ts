import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
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
export class SidebarComponent {
  layoutDashboard = LayoutDashboard;
  activity = Activity;
  fileText = FileText;
  settings = Settings;
  users = Users;
  alertTriangle = TriangleAlert;
  barChart = ChartColumn;
  cpu = Cpu;
  factory = Factory;

  overviewItems: NavItem[] = [
    { label: 'Dashboard', icon: this.layoutDashboard, route: '/dashboard' },
    { label: 'Real-time Monitor', icon: this.activity, comingSoon: true },
    { label: 'Analytics', icon: this.barChart, route: '/analytics' },
  ];

  productionItems: NavItem[] = [
    { label: 'Equipment', icon: this.cpu, route: '/equipment' },
    { label: 'Reports', icon: this.fileText, comingSoon: true },
    { label: 'Alerts', icon: this.alertTriangle, comingSoon: true, badge: 3 },
  ];

  managementItems: NavItem[] = [
    { label: 'Users', icon: this.users, comingSoon: true },
    { label: 'Settings', icon: this.settings, comingSoon: true },
  ];

  showComingSoon() {
    alert('🚧 Coming soon');
  }
}
