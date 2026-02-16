import { EquipmentStatus } from '@shared/services';

export const EQUIPMENT_BADGE_CLASSES: Record<EquipmentStatus['status'], string> = {
  running: 'bg-success text-success-foreground',
  maintenance: 'bg-secondary text-secondary-foreground',
  error: 'bg-destructive text-destructive-foreground',
  idle: 'bg-transparent border border-border text-muted-foreground',
};
