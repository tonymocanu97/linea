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