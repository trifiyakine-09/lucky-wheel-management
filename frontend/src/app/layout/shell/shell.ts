import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ReactiveFormsModule],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private readonly fb = inject(FormBuilder);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly menuOpen = signal(false);
  readonly showPasswordModal = signal(false);
  readonly showAdminModal = signal(false);
  readonly loading = signal(false);
  readonly feedback = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  readonly passwordForm = this.fb.nonNullable.group({
    current_password: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', Validators.required],
  });

  readonly adminForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', Validators.required],
  });

  toggleMenu(): void { this.menuOpen.update((v) => !v); }
  closeMenu(): void { this.menuOpen.set(false); }

  openPasswordModal(): void {
    this.closeMenu();
    this.passwordForm.reset();
    this.feedback.set(null);
    this.showPasswordModal.set(true);
  }

  openAdminModal(): void {
    this.closeMenu();
    this.adminForm.reset();
    this.feedback.set(null);
    this.showAdminModal.set(true);
  }

  closeModals(): void {
    this.showPasswordModal.set(false);
    this.showAdminModal.set(false);
  }

  goJournal(): void {
    this.closeMenu();
    this.router.navigate(['/journal']);
  }

  submitPassword(): void {
    if (this.passwordForm.invalid) return;
    const { current_password, password, password_confirmation } = this.passwordForm.getRawValue();
    if (password !== password_confirmation) {
      this.feedback.set({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    this.loading.set(true);
    this.feedback.set(null);
    this.authService.changePassword(current_password, password, password_confirmation).subscribe({
      next: (res) => { this.loading.set(false); this.feedback.set({ type: 'success', text: res.message }); this.passwordForm.reset(); },
      error: (err) => { this.loading.set(false); this.feedback.set({ type: 'error', text: err.error?.message ?? 'Erreur.' }); },
    });
  }

  submitAdmin(): void {
    if (this.adminForm.invalid) return;
    const data = this.adminForm.getRawValue();
    if (data.password !== data.password_confirmation) {
      this.feedback.set({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    this.loading.set(true);
    this.feedback.set(null);
    this.authService.createAdmin(data).subscribe({
      next: (user) => { this.loading.set(false); this.feedback.set({ type: 'success', text: `Administrateur "${user.name}" créé avec succès.` }); this.adminForm.reset(); },
      error: (err) => { this.loading.set(false); this.feedback.set({ type: 'error', text: err.error?.message ?? 'Erreur.' }); },
    });
  }

  logout(): void {
    this.closeMenu();
    this.authService.logout();
  }
}