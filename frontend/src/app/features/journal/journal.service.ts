import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface LogEntry {
  id: number;
  action: string;
  details: string | null;
  user: { id: number; name: string } | null;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class JournalService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api/logs';
  private readonly http = inject(HttpClient);

  readonly logs = signal<LogEntry[]>([]);

  load(): void {
    this.http.get<LogEntry[]>(this.apiUrl).subscribe((data) => this.logs.set(data));
  }
}