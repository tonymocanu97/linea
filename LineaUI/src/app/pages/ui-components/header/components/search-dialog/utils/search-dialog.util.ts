import { resolveSeverity } from '@pages/alerts/utils';
import { GeneratedReport } from '@shared/services';

export function mapDowntimeToSearchAlert(downtime: any) {
  return {
    id: downtime.id,
    name: `${getSeverityLabel(downtime.type)} - ${downtime.equipmentName}`,
    severity: resolveSeverity(downtime.type),
    path: '/alerts',
  };
}

export function getSeverityLabel(type: string): string {
  const lower = type.toLowerCase();

  if (lower.includes('breakdown')) return 'Breakdown';
  if (lower.includes('maintenance')) return 'Maintenance Due';
  if (lower.includes('material')) return 'Material Issue';

  return 'Alert';
}

export function filterSearchResults(
  query: string,
  pages: any[],
  equipment: any[],
  alerts: any[],
  reports: any[],
) {
  const q = query.toLowerCase().trim();

  if (!q) {
    return {
      pages: [],
      equipment: [],
      alerts: [],
      reports: [],
    };
  }

  return {
    pages: pages.filter((p) => p.name.toLowerCase().includes(q)),
    equipment: equipment.filter(
      (e) => e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q),
    ),
    alerts: alerts.filter((a) => a.name.toLowerCase().includes(q)),
    reports: reports.filter((r) => r.name.toLowerCase().includes(q)),
  };
}

export function mapReportToSearchItem(report: GeneratedReport) {
  return {
    id: report.id,
    name: getReportName(report),
    type: getReportType(report),
    path: '/reports',
  };
}

function getReportName(report: GeneratedReport): string {
  if (report.equipmentName) {
    return `${report.equipmentName} Report`;
  }

  if (report.lineNameFilter) {
    return `${report.lineNameFilter} Production Report`;
  }

  return 'Production Report';
}

function getReportType(report: GeneratedReport): string {
  if (report.equipmentIdFilter) return 'Equipment';
  if (report.lineNameFilter) return 'Production';
  return 'General';
}
