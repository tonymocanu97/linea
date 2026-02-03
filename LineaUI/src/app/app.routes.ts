import { Routes } from '@angular/router';
import { AlertsComponent, AnalyticsComponent, DashboardComponent, EquipmentComponent, ReportsComponent, SettingsComponent } from '@pages';

export const routes: Routes = [
    { path: '', component: DashboardComponent },

    { path: 'dashboard', component: DashboardComponent },
    { path: 'monitor', component: DashboardComponent },
    { path: 'analytics', component: AnalyticsComponent },

    { path: 'equipment', component: EquipmentComponent },
    { path: 'reports', component: ReportsComponent },
    { path: 'alerts', component: AlertsComponent },

    { path: 'users', component: DashboardComponent },
    { path: 'settings', component: SettingsComponent },
];
