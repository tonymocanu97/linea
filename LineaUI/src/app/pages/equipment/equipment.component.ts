import { NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent, SidebarComponent } from '@components';
import { ModalComponent } from '@shared/modals';
import { DashboardApiService, EquipmentStatus } from '@shared/services';
import { Cpu, LucideAngularModule, Plus, Settings, Wrench } from 'lucide-angular';
import { EQUIPMENT_BADGE_CLASSES } from './constants';
import { ConfigureForm, NewEquipment } from './models';
import { calculateUptime, validateNewEquipment } from './utils';

@Component({
  selector: 'app-equipment',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    NgClass,
    FormsModule,
    SidebarComponent,
    HeaderComponent,
    LucideAngularModule,
    ModalComponent,
  ],
  templateUrl: './equipment.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EquipmentComponent {
  cpu = Cpu;
  plus = Plus;
  settings = Settings;
  wrench = Wrench;

  equipmentList: EquipmentStatus[] = [];
  loading = false;
  error?: string;

  addDialogOpen = false;
  configureDialogOpen = false;
  selectedEquipment: EquipmentStatus | null = null;

  newEquipment: NewEquipment = {
    id: '',
    name: '',
    status: 'idle',
    targetProductionRate: 100,
  };

  configForm: ConfigureForm = {
    name: '',
    status: 'running',
    targetProductionRate: 100,
  };

  constructor(private api: DashboardApiService) {
    this.loadEquipment();
  }

  private loadEquipment(): void {
    this.loading = true;
    this.error = undefined;

    this.api.getEquipmentStatus().subscribe({
      next: (equipment) => {
        this.equipmentList = equipment;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error ?? err?.message ?? 'Failed to load equipment.';
        this.loading = false;
      },
    });
  }

  getUptime(equipment: EquipmentStatus): string {
    return calculateUptime(equipment);
  }

  badgeClass(status: EquipmentStatus['status']): string {
    return EQUIPMENT_BADGE_CLASSES[status];
  }

  openAddDialog(): void {
    this.newEquipment = {
      id: '',
      name: '',
      status: 'idle',
      targetProductionRate: 100,
    };
    this.addDialogOpen = true;
  }

  openConfigureDialog(equipment: EquipmentStatus): void {
    this.selectedEquipment = equipment;
    this.configForm = {
      name: equipment.name,
      status: equipment.status,
      targetProductionRate: equipment.targetProductionRate,
    };
    this.configureDialogOpen = true;
  }

  handleAddEquipment(): void {
    const validationError = validateNewEquipment(this.newEquipment, this.equipmentList);

    if (validationError) {
      alert(validationError);
      return;
    }

    this.api.addEquipment(this.newEquipment).subscribe({
      next: (newEq) => {
        this.equipmentList = [...this.equipmentList, newEq];
        this.addDialogOpen = false;
        alert(`${newEq.name} has been added`);
      },
      error: (err) => alert(`Failed to add equipment: ${err}`),
    });
  }

  handleConfigure(): void {
    if (!this.selectedEquipment) return;

    this.api.updateEquipment(this.selectedEquipment.id, this.configForm).subscribe({
      next: (updated) => {
        this.equipmentList = this.equipmentList.map((eq) => (eq.id === updated.id ? updated : eq));

        this.configureDialogOpen = false;
        alert(`${updated.name} has been updated`);
      },
      error: (err) => alert(`Failed to update equipment: ${err}`),
    });
  }
}
