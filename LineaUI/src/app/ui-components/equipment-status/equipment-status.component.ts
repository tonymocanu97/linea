import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { EquipmentStatus } from '@core/models';
import {
  Activity,
  CircleAlert,
  CircleCheck,
  LucideAngularModule,
  Pause,
} from 'lucide-angular';

export type EquipmentStatusType =
  | 'running'
  | 'idle'
  | 'error'
  | 'maintenance';

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

  statusLabels: Record<EquipmentStatusType, { text: string; class: string }> = {
    running: { text: 'Running', class: 'bg-success/20 text-success' },
    idle: { text: 'Idle', class: 'bg-muted text-muted-foreground' },
    error: { text: 'Error', class: 'bg-destructive/20 text-destructive' },
    maintenance: { text: 'Maintenance', class: 'bg-warning/20 text-warning' },
  };

  get runningCount(): number {
    return this.equipment.filter(e => e.status === 'running').length;
  }

  get errorCount(): number {
    return this.equipment.filter(e => e.status === 'error').length;
  }

  efficiencyBarClass(value: number): string {
    if (value >= 90) return 'bg-success';
    if (value >= 70) return 'bg-warning';
    return 'bg-destructive';
  }
}
