import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/login/login').then(m => m.Login) },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell').then(m => m.Shell),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard)},
      { path: 'participants', loadComponent: () => import('./features/participants/participants').then(m => m.Participants) },
      { path: 'cadeaux', loadComponent: () => import('./features/cadeaux/cadeaux').then(m => m.Cadeaux) },
      { path: 'roue', loadComponent: () => import('./features/roue/roue').then(m => m.Roue) },
      { path: 'historique', loadComponent: () => import('./features/coming-soon/coming-soon').then(m => m.ComingSoon), data: { title: 'Historique' } },
    ],
  },
  { path: '**', redirectTo: 'login' },
];