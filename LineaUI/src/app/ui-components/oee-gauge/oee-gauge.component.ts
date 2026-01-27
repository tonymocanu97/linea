import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

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

  private readonly colorClasses: Record<
    OEEGaugeColor,
    { stroke: string; text: string; glow: string }
  > = {
    primary: {
      stroke: 'stroke-primary',
      text: 'text-primary',
      glow: 'drop-shadow-[0_0_10px_hsl(187,92%,50%,0.5)]',
    },
    success: {
      stroke: 'stroke-success',
      text: 'text-success',
      glow: 'drop-shadow-[0_0_10px_hsl(142,76%,36%,0.5)]',
    },
    warning: {
      stroke: 'stroke-warning',
      text: 'text-warning',
      glow: 'drop-shadow-[0_0_10px_hsl(45,93%,47%,0.5)]',
    },
    destructive: {
      stroke: 'stroke-destructive',
      text: 'text-destructive',
      glow: 'drop-shadow-[0_0_10px_hsl(0,72%,51%,0.5)]',
    },
  };

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
    return [c.stroke, c.glow];
  }

  get textClassList(): string[] {
    const c = this.colorClasses[this.color] ?? this.colorClasses.primary;
    return ['font-mono', 'text-2xl', 'font-bold', c.text];
  }
}
