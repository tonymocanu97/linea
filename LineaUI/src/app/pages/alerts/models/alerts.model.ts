import { AlertSeverity } from './alerts.enum';

export interface Alert {
  id: string;
  title: string;
  machine: string;
  severity: AlertSeverity;
  time: string;
  resolved: boolean;
}

export interface AlertStat {
  label: string;
  value: number;
  icon: any;
  color?: string;
}
