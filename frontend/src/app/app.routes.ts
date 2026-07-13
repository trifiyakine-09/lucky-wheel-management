import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/login/login').then(m => m.Login) },
  { path: '', canActivate: [authGuard], children: [] },
  { path: '**', redirectTo: 'login' },
];