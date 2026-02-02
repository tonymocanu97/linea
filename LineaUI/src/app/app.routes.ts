import { Routes } from '@angular/router';
import { EquipmentComponent } from '@components/equipment/equipment.component';
import { AnalyticsComponent } from '@pages/analytics/analytics.component';
import { DashboardComponent } from '@pages/dashboard/dashboard.component';
import { ReportsComponent } from '@components/reports/reports.component';
import { AlertsComponent } from '@components/alerts/alerts.component';

export const routes: Routes = [
    { path: '', component: DashboardComponent },

    { path: 'dashboard', component: DashboardComponent },
    { path: 'monitor', component: DashboardComponent },
    { path: 'analytics', component: AnalyticsComponent },

    { path: 'equipment', component: EquipmentComponent },
    { path: 'reports', component: ReportsComponent },
    { path: 'alerts', component: AlertsComponent },

    { path: 'users', component: DashboardComponent },
    { path: 'settings', component: DashboardComponent },
];
