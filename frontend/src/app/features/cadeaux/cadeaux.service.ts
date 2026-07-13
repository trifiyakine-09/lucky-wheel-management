import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Cadeau {
  id: number;
  nom: string;
  description: string | null;
  quantite: number;
  couleur: string | null;
  actif: boolean;
}

export type CadeauInput = Pick<Cadeau, 'nom' | 'description' | 'quantite' | 'couleur'>;

@Injectable({ providedIn: 'root' })
export class CadeauxService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api/cadeaux';
  private readonly http = inject(HttpClient);

  readonly cadeaux = signal<Cadeau[]>([]);

  load(): void {
    this.http.get<Cadeau[]>(this.apiUrl).subscribe((data) => this.cadeaux.set(data));
  }

  create(input: Partial<CadeauInput>): Observable<Cadeau> {
    return this.http.post<Cadeau>(this.apiUrl, input).pipe(tap(() => this.load()));
  }

  update(id: number, input: Partial<CadeauInput>): Observable<Cadeau> {
    return this.http.put<Cadeau>(`${this.apiUrl}/${id}`, input).pipe(tap(() => this.load()));
  }

  toggle(id: number): Observable<Cadeau> {
    return this.http.patch<Cadeau>(`${this.apiUrl}/${id}/toggle`, {}).pipe(tap(() => this.load()));
  }

  remove(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`).pipe(tap(() => this.load()));
  }
}