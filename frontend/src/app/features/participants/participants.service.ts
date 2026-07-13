import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Participant {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  created_at: string;
}

export interface ImportResult {
  message: string;
  importes: number;
  doublons: number;
  invalides: number;
}

@Injectable({ providedIn: 'root' })
export class ParticipantsService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api/participants';
  private readonly http = inject(HttpClient);

  readonly participants = signal<Participant[]>([]);

  load(): void {
    this.http.get<Participant[]>(this.apiUrl).subscribe((data) => this.participants.set(data));
  }

  importFile(file: File): Observable<ImportResult> {
    const formData = new FormData();
    formData.append('fichier', file);
    return this.http.post<ImportResult>(`${this.apiUrl}/import`, formData);
  }
}