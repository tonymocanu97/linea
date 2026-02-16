export interface ChartPoint {
  time: string;
  production: number;
  target: number;
}

export function calculateMaxValue(data: ChartPoint[]): number {
  if (!data?.length) return 1;

  const max = Math.max(...data.map((d) => Math.max(d.production, d.target)));

  if (max <= 0) return 1;

  return max * 1.1;
}

export function calculateXStep(dataLength: number, width: number, padding: number): number {
  if (dataLength <= 1) return 0;
  return (width - padding * 2) / (dataLength - 1);
}

export function getX(index: number, xStep: number, padding: number): number {
  return padding + index * xStep;
}

export function getY(value: number, maxValue: number, height: number, padding: number): number {
  const usableHeight = height - padding * 2;

  return padding + usableHeight * (1 - value / maxValue);
}

export function buildLinePath(
  values: number[],
  dataLength: number,
  width: number,
  height: number,
  padding: number,
  maxValue: number,
): string {
  if (!values?.length) return '';

  const xStep = calculateXStep(dataLength, width, padding);

  return values
    .map((value, index) => {
      const x = getX(index, xStep, padding);
      const y = getY(value, maxValue, height, padding);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

export function buildAreaPath(
  values: number[],
  dataLength: number,
  width: number,
  height: number,
  padding: number,
  maxValue: number,
): string {
  if (!values?.length) return '';

  const line = buildLinePath(values, dataLength, width, height, padding, maxValue);

  const xStep = calculateXStep(dataLength, width, padding);

  const lastX = getX(dataLength - 1, xStep, padding);

  const baseY = height - padding;

  return `${line} L ${lastX} ${baseY} L ${padding} ${baseY} Z`;
}

export function buildYTicks(maxValue: number, steps = 4): number[] {
  if (maxValue <= 0) return [0];

  const tick = maxValue / steps;

  return Array.from({ length: steps + 1 }, (_, i) => Math.round(tick * i));
}
