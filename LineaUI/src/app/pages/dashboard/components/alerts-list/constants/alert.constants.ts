import { AlertType } from '../models';

export const ALERT_STYLE_MAP: Record<AlertType, { bg: string; icon: string }> = {
  error: {
    bg: 'bg-destructive/10 border-destructive/30',
    icon: 'text-destructive',
  },
  warning: {
    bg: 'bg-warning/10 border-warning/30',
    icon: 'text-warning',
  },
  info: {
    bg: 'bg-primary/10 border-primary/30',
    icon: 'text-primary',
  },
};
