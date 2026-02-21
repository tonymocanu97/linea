import { NgClass, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';
import { METRIC_STATUS_BG, METRIC_STATUS_COLORS } from './constants';

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

  statusColors = METRIC_STATUS_COLORS;
  statusBg = METRIC_STATUS_BG;
}
