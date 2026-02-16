import { AlertSeverity } from '../models';

export function resolveSeverity(downtimeType: string): AlertSeverity {
  const type = downtimeType.toLowerCase();

  if (type.includes('breakdown')) return AlertSeverity.Error;
  if (type.includes('maintenance')) return AlertSeverity.Warning;
  if (type.includes('material')) return AlertSeverity.Info;

  return AlertSeverity.Warning;
}
