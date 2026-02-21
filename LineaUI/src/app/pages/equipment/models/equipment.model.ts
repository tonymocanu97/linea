import { EquipmentStatus } from '@shared/services';

export interface NewEquipment {
  id: string;
  name: string;
  status: EquipmentStatus['status'];
  targetProductionRate: number;
}

export interface ConfigureForm {
  name: string;
  status: EquipmentStatus['status'];
  targetProductionRate: number;
}
