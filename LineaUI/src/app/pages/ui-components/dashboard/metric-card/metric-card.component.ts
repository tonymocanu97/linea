import { NgClass, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [NgClass, NgIf, LucideAngularModule],
  templateUrl: './metric-card.component.html',
})
export class MetricCardComponent {
  @Input() title!: string;
  @Input() value!: string | number;
  @Input() unit?: string;
  @Input() icon!: LucideIconData;

  @Input() status: 'success' | 'warning' | 'error' = 'success';
  @Input() className?: string;
  @Input() delay = 0;

  statusColors = {
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-destructive',
  };

  statusBg = {
    success: 'bg-success/10',
    warning: 'bg-warning/10',
    error: 'bg-destructive/10',
  };
}
