import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Gagnant, HistoriqueService } from './historique.service';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './historique.html',
  styleUrl: './historique.scss',
})
export class Historique implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly historiqueService = inject(HistoriqueService);

  readonly filtreForm = this.fb.nonNullable.group({
    search: [''],
    date_debut: [''],
    date_fin: [''],
  });

  ngOnInit(): void {
    this.historiqueService.load();
  }

  filtrer(): void {
    this.historiqueService.load(this.filtreForm.getRawValue());
  }

  reinitialiser(): void {
    this.filtreForm.reset({ search: '', date_debut: '', date_fin: '' });
    this.historiqueService.load();
  }

  exporter(): void {
    this.historiqueService.export(this.filtreForm.getRawValue());
  }
  annuler(g: Gagnant): void {
  if (!confirm(`Annuler ce tirage ?\n${g.participant.prenom} ${g.participant.nom} — ${g.cadeau.nom}\n\nLe participant redeviendra éligible et le stock sera restauré.`)) return;
  this.historiqueService.annuler(g.id).subscribe({
    next: () => this.filtrer(),
    error: (err) => alert(err.error?.message ?? 'Annulation impossible.'),
  });
}
}