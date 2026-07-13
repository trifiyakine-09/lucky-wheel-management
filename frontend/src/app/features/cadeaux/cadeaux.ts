import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CadeauxService, Cadeau } from './cadeaux.service';

@Component({
  selector: 'app-cadeaux',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './cadeaux.html',
  styleUrl: './cadeaux.scss',
})
export class Cadeaux implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly cadeauxService = inject(CadeauxService);

  readonly showModal = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    description: [''],
    quantite: [0, [Validators.required, Validators.min(0)]],
    couleur: ['#FFC72C'],
  });

  ngOnInit(): void {
    this.cadeauxService.load();
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ nom: '', description: '', quantite: 0, couleur: '#FFC72C' });
    this.errorMessage.set(null);
    this.showModal.set(true);
  }

  openEdit(cadeau: Cadeau): void {
    this.editingId.set(cadeau.id);
    this.form.reset({
      nom: cadeau.nom,
      description: cadeau.description ?? '',
      quantite: cadeau.quantite,
      couleur: cadeau.couleur ?? '#FFC72C',
    });
    this.errorMessage.set(null);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMessage.set(null);

    const payload = this.form.getRawValue();
    const id = this.editingId();
    const request$ = id ? this.cadeauxService.update(id, payload) : this.cadeauxService.create(payload);

    request$.subscribe({
      next: () => { this.loading.set(false); this.showModal.set(false); },
      error: (err) => { this.loading.set(false); this.errorMessage.set(err.error?.message ?? 'Erreur.'); },
    });
  }

  toggle(cadeau: Cadeau): void {
    this.cadeauxService.toggle(cadeau.id).subscribe();
  }

  remove(cadeau: Cadeau): void {
    if (!confirm(`Supprimer "${cadeau.nom}" ?`)) return;
    this.cadeauxService.remove(cadeau.id).subscribe({
      error: (err) => alert(err.error?.message ?? 'Suppression impossible.'),
    });
  }
}