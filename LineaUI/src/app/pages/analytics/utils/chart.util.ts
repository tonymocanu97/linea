export function getBarHeight(value: number, max: number): number {
  return (value / max) * 100;
}

export function getEfficiencyPoints(efficiencyData: { day: string; efficiency: number }[]): string {
  if (efficiencyData.length === 0) return '';
  return efficiencyData
    .map((d, i) => {
      const x = 50 + (i * 330) / (efficiencyData.length - 1);
      const y = 220 - d.efficiency * 1.9;
      return `${x},${y}`;
    })
    .join(' ');
}

export function getEfficiencyAreaPath(
  efficiencyData: { day: string; efficiency: number }[],
): string {
  if (efficiencyData.length === 0) return '';
  let path = 'M 50 220';
  efficiencyData.forEach((d, i) => {
    const x = 50 + (i * 330) / (efficiencyData.length - 1);
    const y = 220 - d.efficiency * 1.9;
    path += ` L ${x} ${y}`;
  });
  path += ' L 380 220 Z';
  return path;
}

export function getEnergyLinePath(
  energyData: { hour: string; consumption: number }[],
  maxEnergyValue: number,
): string {
  if (energyData.length === 0) return '';
  const safeMax = maxEnergyValue > 0 ? maxEnergyValue : 1;
  const divisor = Math.max(energyData.length - 1, 1);
  return energyData
    .map((d, i) => {
      const x = 50 + (i * 330) / divisor;
      const y = 220 - (d.consumption / safeMax) * 190;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

export function getEnergyAreaPath(
  energyData: { hour: string; consumption: number }[],
  maxEnergyValue: number,
): string {
  if (energyData.length === 0) return '';
  const safeMax = maxEnergyValue > 0 ? maxEnergyValue : 1;
  const divisor = Math.max(energyData.length - 1, 1);
  let path = 'M 50 220';
  energyData.forEach((d, i) => {
    const x = 50 + (i * 330) / divisor;
    const y = 220 - (d.consumption / safeMax) * 190;
    path += ` L ${x} ${y}`;
  });
  path += ' L 380 220 Z';
  return path;
}

function getPieSlicePath(startAngle: number, endAngle: number): string {
  const cx = 100;
  const cy = 100;
  const radius = 80;
  const innerRadius = 50;

  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;

  const x1 = cx + radius * Math.cos(startRad);
  const y1 = cy + radius * Math.sin(startRad);
  const x2 = cx + radius * Math.cos(endRad);
  const y2 = cy + radius * Math.sin(endRad);
  const x3 = cx + innerRadius * Math.cos(endRad);
  const y3 = cy + innerRadius * Math.sin(endRad);
  const x4 = cx + innerRadius * Math.cos(startRad);
  const y4 = cy + innerRadius * Math.sin(startRad);

  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${x1},${y1} A ${radius},${radius} 0 ${largeArc},1 ${x2},${y2} L ${x3},${y3} A ${innerRadius},${innerRadius} 0 ${largeArc},0 ${x4},${y4} Z`;
}

export function getDefectSlices(
  defectData: { type: string; value: number; color: string; percentage: number }[],
): { path: string; color: string }[] {
  let currentAngle = -90;
  return defectData.map((defect) => {
    const sliceAngle = (defect.percentage / 100) * 360;
    const path = getPieSlicePath(currentAngle, currentAngle + sliceAngle);
    currentAngle += sliceAngle;
    return { path, color: defect.color };
  });
}
