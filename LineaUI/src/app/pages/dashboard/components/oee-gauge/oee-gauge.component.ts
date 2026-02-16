import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { OEE_COLOR_CLASSES } from './constants';

export type OEEGaugeColor = 'primary' | 'success' | 'warning' | 'destructive';

@Component({
  selector: 'app-oee-gauge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './oee-gauge.component.html',
})
export class OeeGaugeComponent {
  @Input({ required: true }) value!: number;
  @Input({ required: true }) label!: string;
  @Input() color: OEEGaugeColor = 'primary';

  readonly radius = 45;
  readonly circumference = 2 * Math.PI * this.radius;

  private readonly colorClasses = OEE_COLOR_CLASSES;

  get clampedValue(): number {
    const v = Number(this.value);
    if (Number.isNaN(v)) return 0;
    return Math.max(0, Math.min(100, v));
  }

  get strokeDashoffset(): number {
    return this.circumference - (this.clampedValue / 100) * this.circumference;
  }

  get ringClassList(): string[] {
    const c = this.colorClasses[this.color] ?? this.colorClasses.primary;
    return [c.stroke];
  }

  get textClassList(): string[] {
    const c = this.colorClasses[this.color] ?? this.colorClasses.primary;
    return ['font-mono', 'text-2xl', 'font-bold', c.text];
  }
}
