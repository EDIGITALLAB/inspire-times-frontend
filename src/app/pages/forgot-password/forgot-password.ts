import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { API_CONFIG } from '../../config/api.config';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPasswordPage {
  email = '';
  message = '';
  error = '';
  notFound = false;
  isLoading = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  onSubmit() {
    this.isLoading = true;
    this.message = '';
    this.error = '';
    this.notFound = false;

    // Mobile: blur the active input to close keyboard before showing result
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    this.http.post(`${API_CONFIG.apiUrl}/auth/forgot-password`, { email: this.email })
      .subscribe({
        next: (res: any) => {
          this.message = res.message;
          this.isLoading = false;
          this.cdr.detectChanges();
          // Scroll success message into view on mobile
          setTimeout(() => {
            const el = document.getElementById('fp-success-msg');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        },
        error: (err: any) => {
          this.isLoading = false;
          if (err.status === 404) {
            this.notFound = true;
          } else {
            this.error = err.error?.error || err.error?.message || 'Something went wrong. Please try again.';
          }
        }
      });
  }
}
