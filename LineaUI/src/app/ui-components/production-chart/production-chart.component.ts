import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-production-chart',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './production-chart.component.html',
})
export class ProductionChartComponent {
  @Input() data: {
    time: string;
    production: number;
    target: number;
  }[] = [];      

  width = 800;
  height = 300;
  padding = 40;

  animationDelay = '300ms';

  get maxValue(): number {
    if (!this.data.length) return 1;
    const m = Math.max(...this.data.map(d => Math.max(d.production, d.target)));
    return m <= 0 ? 1 : m * 1.1;
  }

  get xStep(): number {
    if (this.data.length <= 1) return 0;
    return (this.width - this.padding * 2) / (this.data.length - 1);
  }

  getY(value: number): number {
    const usableHeight = this.height - this.padding * 2;
    return this.padding + usableHeight * (1 - value / this.maxValue);
  }

  getX(index: number): number {
    return this.padding + index * this.xStep;
  }

  get productionPath(): string {
    return this.buildPath(this.data.map(d => d.production));
  }

  get targetPath(): string {
    return this.buildPath(this.data.map(d => d.target));
  }

  get productionArea(): string {
    const line = this.buildPath(this.data.map(d => d.production));
    const lastX = this.getX(this.data.length - 1);
    const baseY = this.height - this.padding;
    return `${line} L ${lastX} ${baseY} L ${this.padding} ${baseY} Z`;
  }

  get yTicks(): number[] {
    const steps = 4;
    const tick = this.maxValue / steps;
    return Array.from({ length: steps + 1 }, (_, i) => Math.round(tick * i));
  }

  private buildPath(values: number[]): string {
    if (!values.length) return '';
    return values
      .map((v, i) => `${i === 0 ? 'M' : 'L'} ${this.getX(i)} ${this.getY(v)}`)
      .join(' ');
  }
}
