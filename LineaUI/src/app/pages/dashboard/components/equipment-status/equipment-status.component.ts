import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { EquipmentStatus } from '@shared/services';
import { Activity, CircleAlert, CircleCheck, LucideAngularModule, Pause } from 'lucide-angular';
import { EQUIPMENT_STATUS_LABELS } from './constants';
import { getEfficiencyBarClass } from './utils';

export type EquipmentStatusType = 'running' | 'idle' | 'error' | 'maintenance';

@Component({
  selector: 'app-equipment-status',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, LucideAngularModule],
  templateUrl: './equipment-status.component.html',
})
export class EquipmentStatusComponent {
  @Input() equipment: EquipmentStatus[] = [];

  animationDelay = '500ms';

  activity = Activity;
  pause = Pause;
  alert = CircleAlert;
  check = CircleCheck;

  statusLabels = EQUIPMENT_STATUS_LABELS;

  get runningCount(): number {
    return this.equipment.filter((e) => e.status === 'running').length;
  }

  get errorCount(): number {
    return this.equipment.filter((e) => e.status === 'error').length;
  }

  getEfficiencyBarClass(efficiency: number): string {
    return getEfficiencyBarClass(efficiency);
  }
}
