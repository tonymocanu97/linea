import { Routes } from '@angular/router';
import { EquipmentComponent } from '@components/equipment/equipment.component';
import { AnalyticsComponent } from '@pages/analytics/analytics.component';
import { DashboardComponent } from '@pages/dashboard/dashboard.component';
import { ReportsComponent } from './ui-components/reports/reports.component';

export const routes: Routes = [
    { path: '', component: DashboardComponent },

    { path: 'dashboard', component: DashboardComponent },
    { path: 'monitor', component: DashboardComponent },
    { path: 'analytics', component: AnalyticsComponent },

    { path: 'equipment', component: EquipmentComponent },
    { path: 'reports', component: ReportsComponent },
    { path: 'alerts', component: DashboardComponent },

    { path: 'users', component: DashboardComponent },
    { path: 'settings', component: DashboardComponent },
];
