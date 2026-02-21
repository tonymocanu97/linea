import { DashboardSummary, HourlyProductionPoint } from '@shared/services';

export function buildProductionTrends(summary: DashboardSummary) {
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

  const totalProduction = (summary.totalGood ?? 0) + (summary.totalScrap ?? 0);

  const weeklyAverage = Math.round(totalProduction / 4);
  const targetPerWeek = 14000;

  const data = weeks.map((week) => {
    const production = Math.round(weeklyAverage * (0.9 + Math.random() * 0.2));

    return {
      week,
      production,
      target: targetPerWeek,
    };
  });

  const maxValue = Math.max(...data.map((d) => Math.max(d.production, d.target)), 1);

  return { data, maxValue };
}

export function buildEfficiencyAnalysis(summary: DashboardSummary) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const totalGood = summary.totalGood ?? 0;
  const totalScrap = summary.totalScrap ?? 0;
  const totalProduced = totalGood + totalScrap;

  const quality = totalProduced === 0 ? 0 : (totalGood * 100) / totalProduced;

  const baseEfficiency = Math.round(quality);

  const data = days.map((day) => ({
    day,
    efficiency: Math.max(0, Math.min(100, Math.round(baseEfficiency + (Math.random() * 10 - 5)))),
  }));

  return { data };
}

export function buildDefectDistribution(topDefects: any[]) {
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  if (topDefects && topDefects.length > 0) {
    const total = topDefects.reduce((sum, d) => sum + d.quantity, 0);

    const data = topDefects.slice(0, 5).map((defect, i) => ({
      type: defect.type,
      value: defect.quantity,
      color: colors[i % colors.length],
      percentage: (defect.quantity / total) * 100,
    }));

    return { data, total };
  }

  return {
    total: 0,
    data: [
      {
        type: 'No defects',
        value: 1,
        color: colors[0],
        percentage: 100,
      },
    ],
  };
}

export function buildEnergyConsumption(hourlyData: HourlyProductionPoint[]) {
  const energyPerUnit = 2.5;

  let data: { hour: string; consumption: number }[];

  if (hourlyData && hourlyData.length > 0) {
    data = hourlyData.slice(0, 24).map((h) => ({
      hour: `${String(h.hour).padStart(2, '0')}:00`,
      consumption: Math.round(h.production * energyPerUnit),
    }));
  } else {
    data = Array.from({ length: 24 }, (_, i) => ({
      hour: `${String(i).padStart(2, '0')}:00`,
      consumption: 0,
    }));
  }

  const maxValue = Math.max(...data.map((d) => d.consumption), 1);

  return { data, maxValue };
}
