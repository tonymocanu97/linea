export interface TopDefect {
  type: string;
  quantity: number;
}

export interface DashboardSummary {
  from: string;
  to: string;
  lineName: string | null;
  totalGood: number;
  totalScrap: number;
  scrapRatePercent: number;
  totalDowntimeMinutes: number;
  topDefects: TopDefect[];
}

export interface HourlyProductionPoint {
  hour: number;
  production: number;
  target: number;
}

export interface Downtime {
  id: string;
  startTime: string;
  endTime: string;
  type: string;
  reason: string;
  lineName: string;
  equipmentName: string;
  duration: number;
}

export interface EquipmentStatus {
  id: string;
  name: string;
  status: 'running' | 'idle' | 'error' | 'maintenance';
  actualProductionRate: number;
  targetProductionRate: number;
  efficiencyPercentage: number;
}

export interface GenerateReportRequest {
  date?: string;
  shift?: number | null;
  lineName?: string;
  equipmentId?: string;
}

export interface GeneratedReport {
  id: string;
  createdAt: string;
  dateFilter?: string;
  shiftFilter?: number;
  lineNameFilter?: string;
  equipmentIdFilter?: string;
  equipmentName?: string;
}