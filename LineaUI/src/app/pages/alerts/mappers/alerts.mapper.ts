import { Downtime } from '@shared/services';
import { formatTimeAgo } from '@shared/utils';
import { Alert } from '../models';
import { resolveSeverity } from '../utils';

export function mapDowntimeToAlert(d: Downtime): Alert {
  return {
    id: d.id,
    title: d.reason || d.type,
    machine: d.equipmentName,
    severity: resolveSeverity(d.type),
    time: formatTimeAgo(d.startTime),
    resolved: !!d.endTime,
  };
}
