import {
  Activity,
  ChartColumn,
  Cpu,
  FileText,
  LayoutDashboard,
  Settings,
  TriangleAlert,
  Users,
} from 'lucide-angular';
import { NavItem } from '../models';

export const OVERVIEW_NAV: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard' },
  { label: 'Real-time Monitor', icon: Activity, comingSoon: true },
  { label: 'Analytics', icon: ChartColumn, route: '/analytics' },
];

export const PRODUCTION_NAV: NavItem[] = [
  { label: 'Equipment', icon: Cpu, route: '/equipment' },
  { label: 'Reports', icon: FileText, route: '/reports' },
  { label: 'Alerts', icon: TriangleAlert, route: '/alerts' },
];

export const MANAGEMENT_NAV: NavItem[] = [
  { label: 'Users', icon: Users, comingSoon: true },
  { label: 'Settings', icon: Settings, route: '/settings' },
];
