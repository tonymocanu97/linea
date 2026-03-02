import { Routes } from '@angular/router';
import {
  AiInsightsComponent,
  AlertsComponent,
  AnalyticsComponent,
  DashboardComponent,
  EquipmentComponent,
  LoginComponent,
  ReportsComponent,
  SettingsComponent,
  UsersComponent,
} from '@pages';
import { authGuard } from '@shared/guards/auth.guard';
import { supervisorGuard } from '@shared/guards/supervisor.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  { path: '', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'analytics', component: AnalyticsComponent, canActivate: [authGuard] },
  { path: 'ai-insights', component: AiInsightsComponent, canActivate: [authGuard] },

  { path: 'equipment', component: EquipmentComponent, canActivate: [authGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [authGuard] },
  { path: 'alerts', component: AlertsComponent, canActivate: [authGuard] },

  { path: 'users', component: UsersComponent, canActivate: [supervisorGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
];
