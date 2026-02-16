import { resolveSeverity } from '@pages/alerts/utils';
import { Downtime } from '@shared/services';
import { formatTimeAgo } from '@shared/utils';
import { AlertItem } from '../models';

export function mapDowntimeToDashboardAlert(downtime: Downtime): AlertItem {
  const severity = resolveSeverity(downtime.type);
  const type = severity === 'error' ? 'error' : 'warning';

  return {
    id: downtime.id,
    type,
    title: downtime.reason || downtime.type,
    description: `${downtime.lineName} stopped due to ${downtime.reason || downtime.type}`,
    time: formatTimeAgo(downtime.startTime),
    equipment: downtime.equipmentName,
  };
}
