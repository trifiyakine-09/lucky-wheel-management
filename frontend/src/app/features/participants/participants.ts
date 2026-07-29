import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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
  private readonly route = inject(ActivatedRoute);

  readonly uploading = signal(false);
  readonly importResult = signal<ImportResult | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly selectedFileName = signal<string | null>(null);
  readonly filtre = signal<Filtre>('tous');

  private selectedFile: File | null = null;

  readonly participantsAffiches = computed(() => {
    const liste = this.participantsService.participants();
    switch (this.filtre()) {
      case 'restants': return liste.filter((p) => !p.a_gagne);
      case 'gagnants': return liste.filter((p) => p.a_gagne);
      default: return liste;
    }
  });

  ngOnInit(): void {
  this.participantsService.load();
  this.route.queryParamMap.subscribe((params) => {
    const filtreUrl = params.get('filtre');
    if (filtreUrl === 'restants' || filtreUrl === 'gagnants') {
      this.filtre.set(filtreUrl);
    }
  });
}

  changerFiltre(f: Filtre): void {
    this.filtre.set(f);
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