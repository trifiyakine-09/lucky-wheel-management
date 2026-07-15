import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface DashboardStats {
  total_participants: number;
  total_gagnants: number;
  participants_restants: number;
  cadeaux_actifs: number;
  stock_restant: number;
  gagnants_par_cadeau: { nom: string; couleur: string | null; total: number }[];
  tirages_par_jour: { jour: string; total: number }[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api/dashboard';
  private readonly http = inject(HttpClient);

  readonly stats = signal<DashboardStats | null>(null);

  load(): void {
    this.http.get<DashboardStats>(this.apiUrl).subscribe((data) => this.stats.set(data));
  }
}