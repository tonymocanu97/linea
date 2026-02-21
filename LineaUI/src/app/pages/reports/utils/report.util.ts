import { GeneratedReport } from '@shared/services';

export function buildFilterSummary(report: GeneratedReport): string {
  const parts: string[] = [];

  if (report.dateFilter) {
    parts.push(report.dateFilter.split('T')[0]);
  }

  if (report.shiftFilter) {
    parts.push(`Shift ${report.shiftFilter}`);
  }

  if (report.lineNameFilter) {
    parts.push(report.lineNameFilter);
  }

  if (report.equipmentName) {
    parts.push(report.equipmentName);
  }

  return parts.length > 0 ? parts.join(' | ') : 'All Data';
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();

  window.URL.revokeObjectURL(url);
}
