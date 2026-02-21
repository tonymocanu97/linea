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
  if (dataLength <= 1) return width - padding * 2;
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

  const effectiveLength = Math.max(dataLength, 2);
  const xStep = calculateXStep(effectiveLength, width, padding);
  const safeMax = maxValue > 0 ? maxValue : 1;

  const points = values.map((value, index) => {
    const safeValue = Number.isFinite(value) ? value : 0;
    const x = getX(index, xStep, padding);
    const y = getY(safeValue, safeMax, height, padding);
    return { x, y };
  });

  if (points.length === 1) {
    return `M ${padding} ${points[0].y} L ${width - padding} ${points[0].y}`;
  }

  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
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
  if (!line) return '';

  const effectiveLength = Math.max(dataLength, 2);
  const xStep = calculateXStep(effectiveLength, width, padding);
  const lastIndex = dataLength === 1 ? 1 : dataLength - 1;
  const lastX = getX(lastIndex, xStep, padding);
  const baseY = height - padding;

  return `${line} L ${lastX} ${baseY} L ${padding} ${baseY} Z`;
}

export function buildYTicks(maxValue: number, steps = 4): number[] {
  if (maxValue <= 0) return [0];

  const tick = maxValue / steps;

  return Array.from({ length: steps + 1 }, (_, i) => Math.round(tick * i));
}
