export function getEfficiencyBarClass(value: number): string {
  if (value >= 90) return 'bg-success';
  if (value >= 70) return 'bg-warning';
  return 'bg-destructive';
}
