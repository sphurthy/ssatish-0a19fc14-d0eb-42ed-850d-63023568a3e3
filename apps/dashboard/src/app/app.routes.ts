import { Route } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { DashboardPageComponent } from './pages/dashboard/dashboard.component';
import { LoginPageComponent } from './pages/login/login.component';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'tasks',
  },
  {
    path: 'login',
    component: LoginPageComponent,
  },
  {
    path: 'tasks',
    component: DashboardPageComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: 'tasks',
  },
];
