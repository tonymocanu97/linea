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

export const SEARCH_PAGES = [
  { id: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { id: 'realtime', name: 'Real-time Monitor', path: '/monitor', icon: Activity },
  { id: 'analytics', name: 'Analytics', path: '/analytics', icon: ChartColumn },
  { id: 'equipment', name: 'Equipment', path: '/equipment', icon: Cpu },
  { id: 'reports', name: 'Reports', path: '/reports', icon: FileText },
  { id: 'alerts', name: 'Alerts', path: '/alerts', icon: TriangleAlert },
  { id: 'users', name: 'Users', path: '/users', icon: Users },
  { id: 'settings', name: 'Settings', path: '/settings', icon: Settings },
];
