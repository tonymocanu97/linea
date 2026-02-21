import { DashboardSummary, Downtime, HourlyProductionPoint } from '@shared/services';
import { daysInclusive } from '@shared/utils';

export function buildProductionChartData(hourly: HourlyProductionPoint[]) {
  if (!hourly?.length) return [];

  return hourly
    .sort((a, b) => a.hour - b.hour)
    .map((h) => ({
      time: `${String(h.hour).padStart(2, '0')}:00`,
      production: h.production,
      target: h.target,
    }));
}

export function calculateProductionRatePerHour(summary: DashboardSummary): number {
  const totalGood = summary.totalGood ?? 0;
  const totalScrap = summary.totalScrap ?? 0;
  const totalProduced = totalGood + totalScrap;

  const days = daysInclusive(summary.from, summary.to);
  const plannedMinutes = days * 24 * 60;

  if (plannedMinutes <= 0) return 0;

  const ratePerHour = (totalProduced / plannedMinutes) * 60;

  return Math.round(ratePerHour);
}

export function calculateDowntimeFromRecords(
  downtimes: Downtime[],
  from: string,
  to: string,
): number {
  if (!downtimes?.length) return 0;

  const fromDate = new Date(from);
  const toDate = new Date(to);
  toDate.setHours(23, 59, 59, 999);

  let totalMinutes = 0;

  for (const downtime of downtimes) {
    const startTime = new Date(downtime.startTime);
    const endTime = downtime.endTime ? new Date(downtime.endTime) : new Date();

    if (endTime >= fromDate && startTime <= toDate) {
      const rangeStart = startTime < fromDate ? fromDate : startTime;

      const rangeEnd = endTime > toDate ? toDate : endTime;

      const minutes = Math.max(0, (rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60));

      totalMinutes += minutes;
    }
  }

  return Math.round(totalMinutes);
}

export function computeOeeMetrics(summary: DashboardSummary) {
  const totalGood = summary.totalGood ?? 0;
  const totalScrap = summary.totalScrap ?? 0;
  const totalProduced = totalGood + totalScrap;

  const quality = totalProduced === 0 ? 0 : (totalGood * 100) / totalProduced;

  const days = daysInclusive(summary.from, summary.to);

  const plannedMinutes = days * 24 * 60;

  const downtime = summary.totalDowntimeMinutes ?? 0;

  const availability =
    plannedMinutes <= 0 ? 0 : ((plannedMinutes - downtime) * 100) / plannedMinutes;

  const target = days * 2000;

  const performance = target <= 0 ? 0 : Math.min(100, (totalProduced * 100) / target);

  const oee = (availability / 100) * (performance / 100) * (quality / 100) * 100;

  return {
    availability: clampAndRound(availability),
    performance: clampAndRound(performance),
    quality: clampAndRound(quality),
    oee: clampAndRound(oee),
  };
}

function clampAndRound(v: number): number {
  const n = Number(v);
  if (Number.isNaN(n)) return 0;
  return Math.round(Math.max(0, Math.min(100, n)));
}
