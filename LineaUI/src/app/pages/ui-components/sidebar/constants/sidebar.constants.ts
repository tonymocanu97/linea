import {
  ChartColumn,
  Cpu,
  FileText,
  LayoutDashboard,
  Settings,
  Sparkles,
  TriangleAlert,
  Users,
} from 'lucide-angular';
import { NavItem } from '../models';

export const OVERVIEW_NAV: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard' },
  { label: 'Analytics', icon: ChartColumn, route: '/analytics' },
  { label: 'AI Insights', icon: Sparkles, route: '/ai-insights' },
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
