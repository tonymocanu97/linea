import { EquipmentStatus } from '@shared/services';
import { NewEquipment } from '../models';

export function calculateUptime(equipment: EquipmentStatus): string {
  const uptime = Math.min(99.9, equipment.efficiencyPercentage * 1.1);

  return `${uptime.toFixed(1)}%`;
}

export function validateNewEquipment(
  newEquipment: NewEquipment,
  existing: EquipmentStatus[],
): string | null {
  if (!newEquipment.id || !newEquipment.name) {
    return 'Please fill in all required fields';
  }

  if (existing.some((eq) => eq.id === newEquipment.id)) {
    return 'Equipment ID already exists';
  }

  return null;
}
