import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent, SidebarComponent } from '@components';
import { DashboardApiService, EquipmentStatus, ModalComponent } from '@shared';
import {
  Cpu,
  LucideAngularModule,
  Plus,
  Settings,
  Wrench,
} from 'lucide-angular';

interface NewEquipment {
  id: string;
  name: string;
  status: EquipmentStatus['status'];
  targetProductionRate: number;
}

interface ConfigureForm {
  name: string;
  status: EquipmentStatus['status'];
  targetProductionRate: number;
}

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
    const uptime = Math.min(99.9, equipment.efficiencyPercentage * 1.1);
    return `${uptime.toFixed(1)}%`;
  }

  badgeClass(status: EquipmentStatus['status']): string {
    switch (status) {
      case 'running':
        return 'bg-success text-success-foreground';
      case 'maintenance':
        return 'bg-secondary text-secondary-foreground';
      case 'error':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-transparent border border-border text-muted-foreground';
    }
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
    if (!this.newEquipment.id || !this.newEquipment.name) {
      alert('Please fill in all required fields');
      return;
    }

    if (this.equipmentList.find((eq) => eq.id === this.newEquipment.id)) {
      alert('Equipment ID already exists');
      return;
    }

    this.api.addEquipment(this.newEquipment).subscribe({
      next: (newEq) => {
        this.equipmentList.push(newEq);
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
        const index = this.equipmentList.findIndex(eq => eq.id === this.selectedEquipment!.id);
        if (index !== -1) {
          this.equipmentList[index] = updated;
        }
        this.configureDialogOpen = false;
        alert(`${updated.name} has been updated`);
      },
      error: (err) => alert(`Failed to update equipment: ${err}`),
    });
  }
}
