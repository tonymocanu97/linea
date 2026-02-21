import { AlertSeverity } from '../models';

export const SEVERITY_STYLES: Record<
  AlertSeverity,
  {
    bg: string;
    text: string;
  }
> = {
  [AlertSeverity.Error]: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
  },
  [AlertSeverity.Warning]: {
    bg: 'bg-warning/10',
    text: 'text-warning',
  },
  [AlertSeverity.Success]: {
    bg: 'bg-success/10',
    text: 'text-success',
  },
  [AlertSeverity.Info]: {
    bg: 'bg-primary/10',
    text: 'text-primary',
  },
};
