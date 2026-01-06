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
