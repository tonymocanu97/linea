export type AlertType = 'warning' | 'error' | 'info';

export interface AlertItem {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  time: string;
  equipment?: string;
}
