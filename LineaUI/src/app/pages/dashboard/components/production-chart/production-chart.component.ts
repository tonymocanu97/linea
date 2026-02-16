import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

import {
  ChartPoint,
  buildAreaPath,
  buildLinePath,
  buildYTicks,
  calculateMaxValue,
  calculateXStep,
} from './utils';

@Component({
  selector: 'app-production-chart',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './production-chart.component.html',
})
export class ProductionChartComponent {
  @Input() data: ChartPoint[] = [];

  width = 800;
  height = 300;
  padding = 40;

  animationDelay = '300ms';

  get maxValue(): number {
    return calculateMaxValue(this.data);
  }

  get xStep(): number {
    return calculateXStep(this.data.length, this.width, this.padding);
  }

  getX(index: number): number {
    return this.padding + index * this.xStep;
  }

  getY(value: number): number {
    const usableHeight = this.height - this.padding * 2;
    return this.padding + usableHeight * (1 - value / this.maxValue);
  }

  get productionPath(): string {
    return buildLinePath(
      this.data.map((d) => d.production),
      this.data.length,
      this.width,
      this.height,
      this.padding,
      this.maxValue,
    );
  }

  get targetPath(): string {
    return buildLinePath(
      this.data.map((d) => d.target),
      this.data.length,
      this.width,
      this.height,
      this.padding,
      this.maxValue,
    );
  }

  get productionArea(): string {
    return buildAreaPath(
      this.data.map((d) => d.production),
      this.data.length,
      this.width,
      this.height,
      this.padding,
      this.maxValue,
    );
  }

  get yTicks(): number[] {
    return buildYTicks(this.maxValue);
  }
}
