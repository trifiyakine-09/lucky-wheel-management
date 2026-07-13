import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

interface VerifyOtpResponse {
  token: string;
  user: { id: number; name: string; email: string; telephone: string };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api';
  private readonly tokenKey = 'lucky_wheel_token';
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly token = signal<string | null>(localStorage.getItem(this.tokenKey));
  readonly isAuthenticated = computed(() => this.token() !== null);

  login(email: string, password: string, canal: 'email' | 'sms'): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/login`, { email, password, canal });
  }

  verifyOtp(email: string, otp: string): Observable<VerifyOtpResponse> {
    return this.http.post<VerifyOtpResponse>(`${this.apiUrl}/verify-otp`, { email, otp }).pipe(
      tap((res) => {
        localStorage.setItem(this.tokenKey, res.token);
        this.token.set(res.token);
      })
    );
  }
  forgotPassword(email: string, canal: 'email' | 'sms'): Observable<{ message: string }> {
  return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, { email, canal });
}

resetPassword(email: string, otp: string, password: string, password_confirmation: string): Observable<{ message: string }> {
  return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, { email, otp, password, password_confirmation });
}

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    localStorage.removeItem(this.tokenKey);
    this.token.set(null);
    this.router.navigate(['/login']);
  }
}