import { Component, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

type Step = 'password' | 'otp' | 'forgot-email' | 'forgot-reset';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly step = signal<Step>('password');
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly canal = signal<'email' | 'sms'>('email');

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  readonly otpForm = this.fb.nonNullable.group({
    otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  readonly forgotForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  readonly resetForm = this.fb.nonNullable.group({
    otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', Validators.required],
  });

  choisirCanal(c: 'email' | 'sms'): void { this.canal.set(c); }

  switchToForgotPassword(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    const currentEmail = this.loginForm.getRawValue().email;
    if (currentEmail) this.forgotForm.patchValue({ email: currentEmail });
    this.step.set('forgot-email');
  }

  backToLogin(): void {
    this.errorMessage.set(null);
    this.step.set('password');
  }

  submitPassword(): void {
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    this.errorMessage.set(null);
    const { email, password } = this.loginForm.getRawValue();
    this.authService.login(email, password, this.canal()).subscribe({
      next: () => { this.loading.set(false); this.step.set('otp'); },
      error: (err) => { this.loading.set(false); this.errorMessage.set(err.error?.message ?? 'Erreur.'); },
    });
  }

  submitOtp(): void {
    if (this.otpForm.invalid) return;
    this.loading.set(true);
    this.errorMessage.set(null);
    const email = this.loginForm.getRawValue().email;
    const { otp } = this.otpForm.getRawValue();
    this.authService.verifyOtp(email, otp).subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/']); },
      error: (err) => { this.loading.set(false); this.errorMessage.set(err.error?.message ?? 'Code invalide.'); },
    });
  }

  submitForgotEmail(): void {
    if (this.forgotForm.invalid) return;
    this.loading.set(true);
    this.errorMessage.set(null);
    const { email } = this.forgotForm.getRawValue();
    this.authService.forgotPassword(email, this.canal()).subscribe({
      next: () => { this.loading.set(false); this.step.set('forgot-reset'); },
      error: (err) => { this.loading.set(false); this.errorMessage.set(err.error?.message ?? 'Erreur.'); },
    });
  }

  submitReset(): void {
    if (this.resetForm.invalid) return;
    const { otp, password, password_confirmation } = this.resetForm.getRawValue();

    if (password !== password_confirmation) {
      this.errorMessage.set('Les mots de passe ne correspondent pas.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    const email = this.forgotForm.getRawValue().email;

    this.authService.resetPassword(email, otp, password, password_confirmation).subscribe({
      next: () => {
        this.loading.set(false);
        this.loginForm.patchValue({ email, password: '' });
        this.successMessage.set('Mot de passe modifié avec succès. Connecte-toi avec ton nouveau mot de passe.');
        this.step.set('password');
      },
      error: (err) => { this.loading.set(false); this.errorMessage.set(err.error?.message ?? 'Code invalide.'); },
    });
  }
}