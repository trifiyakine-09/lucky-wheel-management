import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Gagnant {
  id: number;
  participant: { id: number; nom: string; prenom: string; telephone: string };
  cadeau: { id: number; nom: string; couleur: string | null };
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class RoueService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api/tirages';
  private readonly http = inject(HttpClient);

  lancerTirage(cadeauId: number): Observable<Gagnant> {
    return this.http.post<Gagnant>(this.apiUrl, { cadeau_id: cadeauId });
  }
}