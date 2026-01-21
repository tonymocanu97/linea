import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
    { path: '', component: DashboardComponent },

    { path: 'dashboard', component: DashboardComponent },
    { path: 'monitor', component: DashboardComponent },
    { path: 'analytics', component: DashboardComponent },

    { path: 'equipment', component: DashboardComponent },
    { path: 'reports', component: DashboardComponent },
    { path: 'alerts', component: DashboardComponent },

    { path: 'users', component: DashboardComponent },
    { path: 'settings', component: DashboardComponent },
];
