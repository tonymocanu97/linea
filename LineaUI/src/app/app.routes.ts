import { Routes } from '@angular/router';
import {
  AiInsightsComponent,
  AlertsComponent,
  AnalyticsComponent,
  DashboardComponent,
  EquipmentComponent,
  ReportsComponent,
  SettingsComponent,
} from '@pages';

export const routes: Routes = [
  { path: '', component: DashboardComponent },

  { path: 'dashboard', component: DashboardComponent },
  { path: 'analytics', component: AnalyticsComponent },
  { path: 'ai-insights', component: AiInsightsComponent },

  { path: 'equipment', component: EquipmentComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'alerts', component: AlertsComponent },

  { path: 'users', component: DashboardComponent },
  { path: 'settings', component: SettingsComponent },
];
