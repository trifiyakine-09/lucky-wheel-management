import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { JournalService } from './journal.service';

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './journal.html',
  styleUrl: './journal.scss',
})
export class Journal implements OnInit {
  protected readonly journalService = inject(JournalService);

  readonly libelles: Record<string, string> = {
    tirage: '🎡 Tirage effectué',
    tirage_annule: '↩ Tirage annulé',
    cadeau_cree: '🎁 Cadeau créé',
    cadeau_modifie: '✏️ Cadeau modifié',
    cadeau_supprime: '🗑️ Cadeau supprimé',
    cadeau_active: '✅ Cadeau activé',
    cadeau_desactive: '⛔ Cadeau désactivé',
    import_participants: '📥 Import de participants',
  };

  ngOnInit(): void {
    this.journalService.load();
  }
}