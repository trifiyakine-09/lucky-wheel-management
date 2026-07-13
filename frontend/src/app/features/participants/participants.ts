import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ParticipantsService, ImportResult } from './participants.service';

@Component({
  selector: 'app-participants',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './participants.html',
  styleUrl: './participants.scss',
})
export class Participants implements OnInit {
  protected readonly participantsService = inject(ParticipantsService);

  readonly uploading = signal(false);
  readonly importResult = signal<ImportResult | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly selectedFileName = signal<string | null>(null);

  private selectedFile: File | null = null;

  ngOnInit(): void {
    this.participantsService.load();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile = file;
    this.selectedFileName.set(file?.name ?? null);
    this.importResult.set(null);
    this.errorMessage.set(null);
  }

  upload(): void {
    if (!this.selectedFile) return;
    this.uploading.set(true);
    this.errorMessage.set(null);
    this.importResult.set(null);

    this.participantsService.importFile(this.selectedFile).subscribe({
      next: (result) => {
        this.uploading.set(false);
        this.importResult.set(result);
        this.selectedFile = null;
        this.selectedFileName.set(null);
        this.participantsService.load();
      },
      error: (err) => {
        this.uploading.set(false);
        this.errorMessage.set(err.error?.message ?? "Erreur lors de l'import.");
      },
    });
  }
}