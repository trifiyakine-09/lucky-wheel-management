import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Participant {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  a_gagne: boolean;
  created_at: string;
}

export interface ImportResult {
  message: string;
  importes: number;
  doublons: number;
  invalides: number;
  retires: number;
}

interface PaginatedResponse {
  data: Participant[];
  current_page: number;
  last_page: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class ParticipantsService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api/participants';
  private readonly http = inject(HttpClient);

  readonly participants = signal<Participant[]>([]);
  readonly currentPage = signal(1);
  readonly lastPage = signal(1);
  readonly total = signal(0);

  load(page: number = 1, filtre: string = 'tous'): void {
    let params = new HttpParams().set('page', page).set('per_page', 25);
    if (filtre !== 'tous') params = params.set('filtre', filtre);

    this.http.get<PaginatedResponse>(this.apiUrl, { params }).subscribe((res) => {
      this.participants.set(res.data);
      this.currentPage.set(res.current_page);
      this.lastPage.set(res.last_page);
      this.total.set(res.total);
    });
  }

  importFile(file: File): Observable<ImportResult> {
    const formData = new FormData();
    formData.append('fichier', file);
    return this.http.post<ImportResult>(`${this.apiUrl}/import`, formData);
  }
}