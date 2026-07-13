import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface Gagnant {
  id: number;
  participant: { id: number; nom: string; prenom: string; telephone: string };
  cadeau: { id: number; nom: string; couleur: string | null };
  created_at: string;
}

export interface HistoriqueFiltres {
  search?: string;
  date_debut?: string;
  date_fin?: string;
}

@Injectable({ providedIn: 'root' })
export class HistoriqueService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api/gagnants';
  private readonly http = inject(HttpClient);

  readonly gagnants = signal<Gagnant[]>([]);

  private buildParams(filtres: HistoriqueFiltres): HttpParams {
    let params = new HttpParams();
    if (filtres.search) params = params.set('search', filtres.search);
    if (filtres.date_debut) params = params.set('date_debut', filtres.date_debut);
    if (filtres.date_fin) params = params.set('date_fin', filtres.date_fin);
    return params;
  }

  load(filtres: HistoriqueFiltres = {}): void {
    this.http.get<Gagnant[]>(this.apiUrl, { params: this.buildParams(filtres) }).subscribe((data) => this.gagnants.set(data));
  }

  export(filtres: HistoriqueFiltres = {}): void {
    this.http.get(`${this.apiUrl}/export`, { params: this.buildParams(filtres), responseType: 'blob' }).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gagnants-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}