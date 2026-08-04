import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ParticipantsService, ImportResult } from './participants.service';

type Filtre = 'tous' | 'restants' | 'gagnants';

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
  readonly filtre = signal<Filtre>('tous');

  private selectedFile: File | null = null;

  ngOnInit(): void {
    this.participantsService.load(1, this.filtre());
  }

  changerFiltre(f: Filtre): void {
    this.filtre.set(f);
    this.participantsService.load(1, f);
  }

  pageSuivante(): void {
    if (this.participantsService.currentPage() < this.participantsService.lastPage()) {
      this.participantsService.load(this.participantsService.currentPage() + 1, this.filtre());
    }
  }

  pagePrecedente(): void {
    if (this.participantsService.currentPage() > 1) {
      this.participantsService.load(this.participantsService.currentPage() - 1, this.filtre());
    }
  }

  allerALaPage(page: number): void {
    const p = Math.max(1, Math.min(page, this.participantsService.lastPage()));
    this.participantsService.load(p, this.filtre());
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
    if (!confirm('Cet import va retirer les participants actuels qui n\'ont pas encore gagné. Les gagnants restent conservés dans l\'historique. Continuer ?')) return;

    this.uploading.set(true);
    this.errorMessage.set(null);
    this.importResult.set(null);

    this.participantsService.importFile(this.selectedFile).subscribe({
      next: (result) => {
        this.uploading.set(false);
        this.importResult.set(result);
        this.selectedFile = null;
        this.selectedFileName.set(null);
        this.participantsService.load(1, this.filtre());
      },
      error: (err) => {
        this.uploading.set(false);
        this.errorMessage.set(err.error?.message ?? "Erreur lors de l'import.");
      },
    });
  }
}